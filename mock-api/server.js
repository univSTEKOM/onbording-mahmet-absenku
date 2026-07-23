import cors from 'cors'
import fs from 'fs'
import express from 'express'
import { createRequire } from 'module'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { eq } from 'drizzle-orm'
import { auth, db } from './auth.js'
import { users as usersSchema, sessions, accounts } from './db-schema.js'

const require = createRequire(import.meta.url)
const jsonServer = require('json-server')
const multer = require('multer')

const upload = multer()
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

async function syncSeedUsers() {
  try {
    const dbRaw = fs.readFileSync('./db.json', 'utf-8')
    const d = JSON.parse(dbRaw)
    const seedUsers = d.users || []
    let synced = 0
    for (const seed of seedUsers) {
      try {
        const result = await auth.api.signUpEmail({
          body: {
            email: seed.email,
            password: seed.password,
            name: seed.nama,
            role: seed.role || 'karyawan',
            status: seed.status || 'approved',
            jabatan: seed.jabatan || '',
            phone: seed.phone || '',
            alamat: seed.alamat || '',
          },
        })
        const newId = result.user.id
        const oldProfile = router.db.get('users').find({ email: seed.email }).value()
        if (oldProfile) {
          router.db.get('users').chain.find({ email: seed.email }).assign({ id: newId }).write()
          router.db.get('absensi').chain.filter({ userId: seed.id.toString() }).each((a) => { a.userId = newId }).value()
          router.db.get('absensi').chain.filter({ userId: seed.id }).each((a) => { a.userId = newId }).value()
          router.db.get('pengajuan').chain.filter({ userId: seed.id.toString() }).each((p) => { p.userId = newId }).value()
          router.db.get('pengajuan').chain.filter({ userId: seed.id }).each((p) => { p.userId = newId }).value()
          router.db.write()
        } else {
          router.db.get('users').push({
            id: newId, email: seed.email, password: seed.password,
            nama: seed.nama, jabatan: seed.jabatan || '',
            role: seed.role || 'karyawan', status: seed.status || 'approved',
            rejectionNotes: [], foto: '', phone: seed.phone || '',
            alamat: seed.alamat || '', createdAt: new Date().toISOString(),
          }).write()
        }
        synced++
      } catch (e) { /* user already exists */ }
    }
    console.log(`Sync: ${synced} seed users synced`)
  } catch (e) { console.error('Sync error:', e.message) }
}

server.use(cors({ origin: 'http://localhost:5173', credentials: true }))

/* ── Rate limiting (manual body parsing — before Better Auth) ── */
const loginAttempts = new Map()
const MAX_ATTEMPTS = 3
const BASE_BLOCK = 30000
const MAX_BLOCK = 120000

server.post('/api/auth/sign-in/email', (req, res, next) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body)
      const key = parsed.email?.toLowerCase()
      if (!key) return next()
      const now = Date.now()
      const record = loginAttempts.get(key)
      if (record && record.count >= MAX_ATTEMPTS) {
        const elapsed = now - record.blockedAt
        if (elapsed < record.duration) {
          return res.status(429).json({ message: `Terlalu banyak percobaan. Coba lagi ${Math.ceil((record.duration - elapsed) / 1000)} detik lagi.` })
        }
        loginAttempts.delete(key)
      }
      const origJson = res.json.bind(res)
      res.json = function (data) {
        if (data?.token || data?.user) { loginAttempts.delete(key) }
        else {
          let a = loginAttempts.get(key)
          if (!a) { a = { count: 0 }; loginAttempts.set(key, a) }
          a.count++
          if (a.count >= MAX_ATTEMPTS) { a.blockedAt = now; a.duration = Math.min(BASE_BLOCK + (a.count - MAX_ATTEMPTS) * 15000, MAX_BLOCK) }
        }
        return origJson(data)
      }
      req.body = parsed; next()
    } catch { next() }
  })
})

/* ── Better Auth handler ── */
server.all('/api/auth/*', toNodeHandler(auth))

/* ── Body parser for custom routes (after Better Auth) ── */
server.use(express.json())

/* ── Helper: admin check ── */
async function requireAdmin(headers) {
  const session = await auth.api.getSession({ headers })
  if (!session) return { error: { status: 401, message: 'Unauthorized' } }
  if (session.user.role !== 'admin') return { error: { status: 403, message: 'Forbidden' } }
  return { session }
}

/* ── Custom routes ── */

server.post('/api/register', async (req, res) => {
  try {
    const { email, password, phone } = req.body
    const nama = req.body.nama || req.body.name || ''
    const jabatan = req.body.jabatan || ''
    const role = req.body.role || 'karyawan'

    if (!email || !password || !nama) return res.status(400).json({ message: 'Email, password, dan nama harus diisi' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Format email tidak valid' })
    if (password.length < 8) return res.status(400).json({ message: 'Password minimal 8 karakter' })
    if (nama.length > 100) return res.status(400).json({ message: 'Nama maksimal 100 karakter' })
    if (jabatan && jabatan.length > 100) return res.status(400).json({ message: 'Jabatan maksimal 100 karakter' })

    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    const isAdminAction = session?.user?.role === 'admin'
    const effectiveRole = isAdminAction ? role : 'karyawan'
    const effectiveStatus = isAdminAction ? 'approved' : 'pending'

    const response = await auth.api.signUpEmail({
      body: { email, password, name: nama, role: effectiveRole, status: effectiveStatus, jabatan, phone: phone || '', alamat: '' },
      asResponse: true,
    })
    if (response.status !== 200) {
      const err = await response.json()
      return res.status(400).json({ message: err.message || 'Gagal mendaftar' })
    }
    const data = await response.json()
    const profile = {
      id: data.user.id, email, nama, jabatan: jabatan || '', role: effectiveRole,
      status: effectiveStatus, rejectionNotes: [], foto: '', phone: phone || '',
      alamat: '', createdAt: new Date().toISOString(),
    }
    router.db.get('users').push(profile).write()
    res.status(201).json({ user: { ...data.user, ...profile } })
  } catch (e) { res.status(400).json({ message: e.message || 'Gagal mendaftar' }) }
})

server.get('/api/me', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session) return res.status(401).json({ message: 'Unauthorized' })
    const profile = router.db.get('users').find({ email: session.user.email }).value() || {}
    res.json({ ...session, user: { ...session.user, ...profile } })
  } catch (e) {
    console.error('/api/me error:', e.message)
    res.status(500).json({ message: 'Gagal memuat profil' })
  }
})

server.patch('/api/users/:id/status', async (req, res) => {
  try {
    const authResult = await requireAdmin(fromNodeHeaders(req.headers))
    if (authResult.error) return res.status(authResult.error.status).json({ message: authResult.error.message })

    const { status: newStatus, note } = req.body
    if (!['approved', 'rejected'].includes(newStatus)) return res.status(400).json({ message: 'Invalid status' })

    const user = router.db.get('users').find({ id: req.params.id }).value()
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

    /* Update di db.json */
    router.db.get('users').chain.find({ id: req.params.id }).assign({ status: newStatus }).write()
    if (newStatus === 'rejected' && note) {
      const notes = user.rejectionNotes || []
      notes.push({ note, createdAt: new Date().toISOString() })
      router.db.get('users').chain.find({ id: req.params.id }).assign({ rejectionNotes: notes }).write()
    }
    if (newStatus === 'approved') {
      router.db.get('users').chain.find({ id: req.params.id }).assign({ rejectionNotes: [] }).write()
    }

    /* Update di Better Auth via Drizzle */
    try {
      await db.update(usersSchema).set({ status: newStatus }).where(eq(usersSchema.id, req.params.id)).run()
    } catch (e) { console.error('Drizzle update error:', e.message) }

    console.log(`Status updated: ${user.email} -> ${newStatus}`)
    res.json({ message: `Status berhasil diubah ke ${newStatus}` })
  } catch (e) {
    console.error('Status change error:', e.message)
    res.status(400).json({ message: 'Gagal: ' + e.message })
  }
})

server.post('/api/users/:id/notes', async (req, res) => {
  try {
    const authResult = await requireAdmin(fromNodeHeaders(req.headers))
    if (authResult.error) return res.status(authResult.error.status).json({ message: authResult.error.message })

    const { note } = req.body
    if (!note) return res.status(400).json({ message: 'Catatan harus diisi' })

    const user = router.db.get('users').find({ id: req.params.id }).value()
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

    const notes = user.rejectionNotes || []
    notes.push({ note, createdAt: new Date().toISOString() })
    router.db.get('users').chain.find({ id: req.params.id }).assign({ rejectionNotes: notes }).write()
    res.json({ message: 'Catatan ditambahkan' })
  } catch (e) { res.status(400).json({ message: 'Gagal: ' + e.message }) }
})

server.delete('/api/users/:id', async (req, res) => {
  try {
    const authResult = await requireAdmin(fromNodeHeaders(req.headers))
    if (authResult.error) return res.status(authResult.error.status).json({ message: authResult.error.message })

    const user = router.db.get('users').find({ id: req.params.id }).value()
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

    /* Hapus dari Better Auth via Drizzle */
    try {
      await db.delete(accounts).where(eq(accounts.userId, req.params.id)).run()
      await db.delete(sessions).where(eq(sessions.userId, req.params.id)).run()
      await db.delete(usersSchema).where(eq(usersSchema.id, req.params.id)).run()
      console.log(`Deleted from Better Auth: ${user.email}`)
    } catch (e) { console.error('Drizzle delete error:', e.message) }

    /* Hapus dari db.json */
    router.db.get('users').remove({ id: req.params.id }).write()
    router.db.get('absensi').remove({ userId: req.params.id }).write()
    router.db.get('pengajuan').remove({ userId: req.params.id }).write()

    console.log(`User fully deleted: ${user.email}`)
    res.json({ message: 'User dan semua data terkait berhasil dihapus' })
  } catch (e) { res.status(400).json({ message: 'Gagal: ' + e.message }) }
})

server.get('/api/users/pending', async (req, res) => {
  const authResult = await requireAdmin(fromNodeHeaders(req.headers))
  if (authResult.error) return res.status(authResult.error.status).json({ message: authResult.error.message })
  const users = router.db.get('users').filter((u) => u.status === 'pending').value()
  res.json(users)
})

server.get('/api/users/all', async (req, res) => {
  const authResult = await requireAdmin(fromNodeHeaders(req.headers))
  if (authResult.error) return res.status(authResult.error.status).json({ message: authResult.error.message })
  const users = router.db.get('users').value()
  res.json(users)
})

/* ── json-server middleware ── */
server.use(upload.none())
server.use(jsonServer.bodyParser)
server.use(middlewares)

/* ── json-server custom middleware ── */
function toMinutes(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function nowTime() { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}` }

const CHECK_IN_START = '06:45'
const CHECK_IN_END = '07:45'
const CHECK_OUT_MIN = '16:00'

server.post('/absensi', (req, res, next) => {
  const t = nowTime(); const m = toMinutes(t)
  if (m < toMinutes(CHECK_IN_START)) return res.status(400).json({ message: `Absensi dibuka pukul ${CHECK_IN_START}.` })
  if (router.db.get('absensi').find({ userId: req.body.userId, tanggal: req.body.tanggal }).value()) return res.status(400).json({ message: 'Sudah absen hari ini' })
  req.body.status = m <= toMinutes(CHECK_IN_END) ? 'hadir' : 'terlambat'; next()
})

server.patch('/absensi/:id', (req, res, next) => {
  if (!req.body.checkOut) return next()
  req.body.status = toMinutes(nowTime()) < toMinutes(CHECK_OUT_MIN) ? 'pulang_cepat' : undefined; next()
})

server.patch('/users/:id', (req, res, next) => {
  const body = req.body
  delete body.status; delete body.rejectionNotes; delete body.role; delete body.id; delete body.createdAt
  if (body.email !== undefined) {
    if (!body.email.trim()) return res.status(400).json({ message: 'Email tidak boleh kosong' })
    if (body.email.length > 100) return res.status(400).json({ message: 'Email maksimal 100 karakter' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return res.status(400).json({ message: 'Format email tidak valid' })
  }
  if (body.nama !== undefined) {
    if (!body.nama.trim()) return res.status(400).json({ message: 'Nama tidak boleh kosong' })
    if (body.nama.length > 100) return res.status(400).json({ message: 'Nama maksimal 100 karakter' })
  }
  if (body.jabatan !== undefined && body.jabatan.length > 100) return res.status(400).json({ message: 'Jabatan maksimal 100 karakter' })
  if (body.phone !== undefined && body.phone) {
    const d = body.phone.replace(/\D/g, '')
    if (d.length < 10) return res.status(400).json({ message: 'No telepon minimal 10 digit' })
    if (d.length > 15) return res.status(400).json({ message: 'No telepon maksimal 15 digit' })
  }
  if (body.alamat !== undefined && body.alamat.length > 500) return res.status(400).json({ message: 'Alamat maksimal 500 karakter' })
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (user && user.status === 'rejected') {
    router.db.get('users').chain.find({ id: req.params.id }).assign({ status: 'pending', rejectionNotes: [] }).write()
  }
  next()
})

server.delete('/users/:id', (req, res) => { res.status(403).json({ message: 'Gunakan endpoint admin: DELETE /api/users/:id' }) })

server.patch('/pengajuan/:id', (req, res, next) => {
  const r = router.db.get('pengajuan').find({ id: Number(req.params.id) }).value()
  if (!r) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' })
  if (req.body.status && r.status !== 'pending') return res.status(400).json({ message: 'Pengajuan sudah diproses' })
  if (req.body.alasan && req.body.alasan.length > 500) return res.status(400).json({ message: 'Alasan maksimal 500 karakter' })
  next()
})

server.delete('/users/:id', (req, res) => {
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })
  /* Hapus juga absensi & pengajuan milik user */
  router.db.get('absensi').remove((a) => a.userId === req.params.id).write()
  router.db.get('pengajuan').remove((p) => p.userId === req.params.id).write()
  router.db.get('users').remove({ id: req.params.id }).write()
  res.status(200).json({ message: 'User dan seluruh data terkait berhasil dihapus' })
})

server.delete('/pengajuan/:id', (req, res) => {
  const r = router.db.get('pengajuan').find({ id: Number(req.params.id) }).value()
  if (!r) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' })
  if (r.status !== 'pending') return res.status(400).json({ message: 'Hanya pending yang bisa dihapus' })
  router.db.get('pengajuan').remove({ id: Number(req.params.id) }).write()
  res.status(200).json({ message: 'Dihapus' })
})

server.get('/api/dashboard/recent', (req, res) => {
  const userId = req.query.userId || null
  let a = router.db.get('absensi').value()
  if (userId) a = a.filter((x) => x.userId === userId)
  const dates = [...new Set(a.map((x) => x.tanggal))].sort().slice(-7)
  res.json({ data: dates.map((t) => { const r = a.filter((x) => x.tanggal === t); return { tanggal: t, checkIn: r[0]?.checkIn, checkOut: r[0]?.checkOut, status: r[0]?.status } }) })
})

server.get('/api/dashboard/hrd/week', (req, res) => {
  const a = router.db.get('absensi').value()
  const u = router.db.get('users').value()
  const k = u.filter((x) => x.role === 'karyawan')
  const today = new Date().toISOString().split('T')[0]
  const ms = new Date(); ms.setDate(1); const msStr = ms.toISOString().split('T')[0]
  const dates = [...new Set(a.map((x) => x.tanggal))].sort().slice(-7)
  const chart = dates.map((d) => {
    const da = a.filter((x) => x.tanggal === d)
    return { name: new Date(d).toLocaleDateString('id-ID', { weekday: 'short' }), hadir: da.filter((x) => x.status === 'hadir').length, terlambat: da.filter((x) => x.status === 'terlambat').length, persen: Math.round(da.filter((x) => ['hadir', 'terlambat'].includes(x.status)).length / k.length * 100) }
  })
  const ta = a.filter((x) => x.tanggal === today)
  res.json({ chart, summary: { totalKaryawan: k.length, hadirHariIni: ta.filter((x) => x.status === 'hadir').length, terlambatHariIni: ta.filter((x) => x.status === 'terlambat').length, izinHariIni: ta.filter((x) => ['izin', 'sakit', 'cuti'].includes(x.status)).length, belumAbsen: k.length - ta.filter((x) => x.checkIn).length, totalAbsensiBulanIni: a.filter((x) => x.tanggal >= msStr).length, weekAvg: chart.length ? Math.round(chart.reduce((s, c) => s + c.persen, 0) / chart.length) : 0, bestDay: chart.length ? chart.reduce((a, b) => a.persen > b.persen ? a : b) : null } })
})

server.get('/api/dashboard/month', (req, res) => {
  const tahun = parseInt(req.query.tahun) || new Date().getFullYear()
  const bulan = parseInt(req.query.bulan) || (new Date().getMonth() + 1)
  const a = router.db.get('absensi').value()
  const u = router.db.get('users').value()
  const total = u.filter((x) => x.role === 'karyawan').length

  const daysInMonth = new Date(tahun, bulan, 0).getDate()
  const data = []

  for (let d = 1; d <= daysInMonth; d++) {
    const tgl = `${tahun}-${String(bulan).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayAbsensi = a.filter((x) => x.tanggal === tgl)
    const hadir = dayAbsensi.filter((x) => x.status === 'hadir').length
    const terlambat = dayAbsensi.filter((x) => x.status === 'terlambat').length
    const checkInOnly = dayAbsensi.filter((x) => x.checkIn && !x.checkOut).length
    const izin = dayAbsensi.filter((x) => ['izin', 'sakit', 'cuti'].includes(x.status)).length
    data.push({
      tanggal: tgl,
      hadir,
      terlambat,
      checkInOnly,
      izin,
      tidakHadir: total - hadir - terlambat - checkInOnly - izin,
    })
  }

  res.json({ data, totalKaryawan: total })
})

server.use(router)

const PORT = process.env.PORT || 3001
syncSeedUsers().then(() => {
  server.listen(PORT, () => { console.log(`Mock API running at http://localhost:${PORT}`) })
})
