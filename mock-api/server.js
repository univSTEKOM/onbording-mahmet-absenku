import 'dotenv/config'
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
const middlewares = jsonServer.defaults({ noCors: true })

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
          router.db.get('users').find({ email: seed.email }).assign({ id: newId }).write()
          router.db.get('absensi').filter({ userId: seed.id.toString() }).each((a) => { a.userId = newId }).value()
          router.db.get('absensi').filter({ userId: seed.id }).each((a) => { a.userId = newId }).value()
          router.db.get('pengajuan').filter({ userId: seed.id.toString() }).each((p) => { p.userId = newId }).value()
          router.db.get('pengajuan').filter({ userId: seed.id }).each((p) => { p.userId = newId }).value()
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

/* ── Body parser (json-server compatible) ── */
server.use(express.json({ limit: '10mb' }))
server.use((req, res, next) => { req._body = true; next() })

/* ── Helper: admin check ── */
async function requireAdmin(headers) {
  const session = await auth.api.getSession({ headers })
  if (!session) {
    console.log('[requireAdmin] no session')
    return { error: { status: 401, message: 'Unauthorized' } }
  }
  let role = session.user.role
  console.log('[requireAdmin] session user:', session.user.email, 'session.role:', role)
  if (!role) {
    const profile = router.db.get('users').find({ email: session.user.email }).value()
    role = profile?.role
    console.log('[requireAdmin] db.json fallback role:', role, 'profile:', profile?.nama)
  }
  if (role !== 'admin') {
    console.log('[requireAdmin] forbidden - role is:', role)
    return { error: { status: 403, message: 'Forbidden' } }
  }
  return { session }
}

/* ── Custom routes ── */

server.post('/api/register', async (req, res) => {
  try {
    const { email, password, phone } = req.body
    const nama = req.body.nama || req.body.name || ''
    const jabatan = req.body.jabatan || ''
    const alamat = req.body.alamat || ''
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
      body: { email, password, name: nama, role: effectiveRole, status: effectiveStatus, jabatan, phone: phone || '', alamat },
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
      alamat: alamat || '', createdAt: new Date().toISOString(),
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
    router.db.get('users').find({ id: req.params.id }).assign({ status: newStatus }).write()
    if (newStatus === 'rejected' && note) {
      const notes = user.rejectionNotes || []
      notes.push({ note, createdAt: new Date().toISOString() })
      router.db.get('users').find({ id: req.params.id }).assign({ rejectionNotes: notes }).write()
    }
    if (newStatus === 'approved') {
      router.db.get('users').find({ id: req.params.id }).assign({ rejectionNotes: [] }).write()
    }

    /* Update di Better Auth via Drizzle */
    try {
      await db.update(usersSchema).set({ status: newStatus }).where(eq(usersSchema.id, req.params.id)).run()
    } catch (e) { console.error('Drizzle update error:', e.message) }

    console.log(`Status updated: ${user.email} -> ${newStatus}`)
    res.json({ message: `Status berhasil diubah ke ${newStatus}` })
  } catch (e) {
    console.error('Status change error:', e.message, e.stack)
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
    router.db.get('users').find({ id: req.params.id }).assign({ rejectionNotes: notes }).write()
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

server.patch('/api/users/:id', async (req, res) => {
  try {
    const authResult = await requireAdmin(fromNodeHeaders(req.headers))
    if (authResult.error) return res.status(authResult.error.status).json({ message: authResult.error.message })

    const body = req.body
    if (body.email !== undefined && body.email) {
      if (body.email.length > 100) return res.status(400).json({ message: 'Email maksimal 100 karakter' })
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return res.status(400).json({ message: 'Format email tidak valid' })
    }
    if (body.nama !== undefined && body.nama) {
      if (!body.nama.trim()) return res.status(400).json({ message: 'Nama tidak boleh kosong' })
      if (body.nama.length > 100) return res.status(400).json({ message: 'Nama maksimal 100 karakter' })
    }
    if (body.jabatan !== undefined && body.jabatan && body.jabatan.length > 100) return res.status(400).json({ message: 'Jabatan maksimal 100 karakter' })
    if (body.phone !== undefined && body.phone) {
      const d = body.phone.replace(/\D/g, '')
      if (d.length < 10) return res.status(400).json({ message: 'No telepon minimal 10 digit' })
      if (d.length > 15) return res.status(400).json({ message: 'No telepon maksimal 15 digit' })
    }
    if (body.alamat !== undefined && body.alamat && body.alamat.length > 500) return res.status(400).json({ message: 'Alamat maksimal 500 karakter' })

    const existing = router.db.get('users').find({ id: req.params.id }).value()
    if (!existing) return res.status(404).json({ message: 'User tidak ditemukan' })

    const updateFields = {}
    if (body.nama !== undefined) updateFields.nama = body.nama
    if (body.jabatan !== undefined) updateFields.jabatan = body.jabatan
    if (body.phone !== undefined) updateFields.phone = body.phone
    if (body.alamat !== undefined) updateFields.alamat = body.alamat
    if (body.role !== undefined) updateFields.role = body.role
    if (body.email !== undefined) updateFields.email = body.email

    router.db.get('users').find({ id: req.params.id }).assign(updateFields).write()

    /* Sync ke Better Auth */
    const syncFields = {}
    if (body.nama !== undefined) syncFields.name = body.nama
    if (body.jabatan !== undefined) syncFields.jabatan = body.jabatan
    if (body.phone !== undefined) syncFields.phone = body.phone
    if (body.alamat !== undefined) syncFields.alamat = body.alamat
    if (body.role !== undefined) syncFields.role = body.role
    if (Object.keys(syncFields).length > 0) {
      try {
        await db.update(usersSchema).set(syncFields).where(eq(usersSchema.id, req.params.id)).run()
      } catch (e) { console.error('Drizzle admin update error:', e.message) }
    }

    res.json({ message: 'User berhasil diupdate' })
  } catch (e) {
    console.error('Admin update error:', e.message, e.stack)
    res.status(400).json({ message: 'Gagal update user: ' + e.message })
  }
})

/* ── json-server middleware ── */
server.use(upload.none())
server.use(middlewares)

/* ── json-server custom middleware ── */
function toMinutes(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function nowTime() { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}` }

const CHECK_IN_START = '06:45'
const CHECK_IN_END = '07:45'
const CHECK_OUT_MIN = '16:00'

function normalizeDbFile() {
  try {
    const dbRaw = fs.readFileSync('./db.json', 'utf-8')
    const d = JSON.parse(dbRaw)

    if (d.absensi && d.absensi.length > 0) {
      d.absensi = d.absensi.map(entry => ({
        id: entry.id,
        userId: entry.userId,
        tanggal: entry.tanggal,
        checkIn: entry.checkIn || null,
        checkOut: entry.checkOut || null,
        status: entry.status || '',
        faceVerified: entry.faceVerified || false,
        photos: entry.photos || [],
        keterangan: entry.keterangan || '',
        createdAt: entry.createdAt || '',
      }))
    }

    if (d.pengajuan && d.pengajuan.length > 0) {
      d.pengajuan = d.pengajuan.map(entry => ({
        id: entry.id,
        userId: entry.userId,
        jenis: entry.jenis,
        tanggalMulai: entry.tanggalMulai,
        tanggalSelesai: entry.tanggalSelesai,
        alasan: entry.alasan,
        status: entry.status,
        catatan: entry.catatan || '',
        createdAt: entry.createdAt || '',
      }))
    }

    fs.writeFileSync('./db.json', JSON.stringify(d, null, 2))
  } catch (e) { console.error('Normalize error:', e.message) }
}

server.post('/absensi', (req, res, next) => {
  try {
    if (!req.body || !req.body.userId) {
      console.error('[absensi] Invalid body:', req.body)
      return res.status(400).json({ message: 'Data absensi tidak valid' })
    }
    const t = nowTime(); const m = toMinutes(t)
    if (m < toMinutes(CHECK_IN_START)) return res.status(400).json({ message: `Absensi dibuka pukul ${CHECK_IN_START}.` })
    if (router.db.get('absensi').find({ userId: req.body.userId, tanggal: req.body.tanggal }).value()) return res.status(400).json({ message: 'Sudah absen hari ini' })
    const status = m <= toMinutes(CHECK_IN_END) ? 'hadir' : 'terlambat'
    req.body = {
      userId: req.body.userId,
      tanggal: req.body.tanggal,
      checkIn: req.body.checkIn || null,
      checkOut: null,
      status,
      faceVerified: req.body.faceVerified || false,
      photos: req.body.photos || [],
      keterangan: req.body.keterangan || '',
      createdAt: req.body.createdAt || new Date().toISOString(),
    }
    next()
  } catch (e) {
    console.error('[absensi] POST error:', e.message, e.stack)
    res.status(500).json({ message: 'Gagal absen: ' + e.message })
  }
})

server.patch('/absensi/:id', (req, res, next) => {
  try {
    if (!req.body || !req.params.id) {
      return res.status(400).json({ message: 'Data tidak valid' })
    }
    if (!req.body.checkOut) return next()
    const existing = router.db.get('absensi').find({ id: Number(req.params.id) }).value()
    if (!existing) return res.status(404).json({ message: 'Absensi tidak ditemukan' })
    const status = toMinutes(nowTime()) < toMinutes(CHECK_OUT_MIN) ? 'pulang_cepat' : existing.status
    req.body = {
      userId: existing.userId,
      tanggal: existing.tanggal,
      checkIn: existing.checkIn,
      checkOut: req.body.checkOut,
      status: status || existing.status,
      faceVerified: existing.faceVerified || false,
      photos: existing.photos || [],
      keterangan: existing.keterangan || '',
      createdAt: existing.createdAt,
    }
    next()
  } catch (e) {
    console.error('[absensi] PATCH error:', e.message, e.stack)
    res.status(500).json({ message: 'Gagal update absensi: ' + e.message })
  }
})

server.patch('/users/:id', async (req, res, next) => {
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
    router.db.get('users').find({ id: req.params.id }).assign({ status: 'pending', rejectionNotes: [] }).write()
  }

  /* Sync ke Better Auth database */
  const syncFields = {}
  if (body.nama !== undefined) syncFields.name = body.nama
  if (body.jabatan !== undefined) syncFields.jabatan = body.jabatan
  if (body.phone !== undefined) syncFields.phone = body.phone
  if (body.alamat !== undefined) syncFields.alamat = body.alamat
  if (body.foto !== undefined) syncFields.foto = body.foto
  if (Object.keys(syncFields).length > 0) {
    try {
      await db.update(usersSchema).set(syncFields).where(eq(usersSchema.id, req.params.id)).run()
    } catch (e) { console.error('Drizzle profile sync error:', e.message) }
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
  const today = new Date()
  const data = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const tgl = d.toISOString().split('T')[0]
    const r = a.filter((x) => x.tanggal === tgl)
    data.push({ tanggal: tgl, checkIn: r[0]?.checkIn || null, checkOut: r[0]?.checkOut || null, status: r[0]?.status || null })
  }
  res.json({ data })
})

server.get('/api/dashboard/hrd/week', (req, res) => {
  const a = router.db.get('absensi').value()
  const u = router.db.get('users').value()
  const k = u.filter((x) => x.role === 'karyawan')
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const ms = new Date(); ms.setDate(1); const msStr = ms.toISOString().split('T')[0]

  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const chart = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    const tgl = d.toISOString().split('T')[0]
    const da = a.filter((x) => x.tanggal === tgl)
    const hadir = da.filter((x) => ['hadir', 'pulang_cepat'].includes(x.status)).length
    const terlambat = da.filter((x) => x.status === 'terlambat').length
    const totalAktif = hadir + terlambat
    chart.push({
      name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      hadir,
      terlambat,
      persen: Math.round(totalAktif / (k.length || 1) * 100),
    })
  }

  const ta = a.filter((x) => x.tanggal === todayStr)
  const hadirHariIni = ta.filter((x) => ['hadir', 'pulang_cepat'].includes(x.status)).length
  const terlambatHariIni = ta.filter((x) => x.status === 'terlambat').length
  const izinHariIni = ta.filter((x) => ['izin', 'sakit', 'cuti'].includes(x.status)).length
  const sudahAbsen = ta.filter((x) => x.checkIn).length
  const weekAvg = chart.length ? Math.round(chart.reduce((s, c) => s + c.persen, 0) / chart.length) : 0

  res.json({
    chart,
    summary: {
      totalKaryawan: k.length,
      hadirHariIni,
      terlambatHariIni,
      izinHariIni,
      belumAbsen: k.length - sudahAbsen,
      totalAbsensiBulanIni: a.filter((x) => x.tanggal >= msStr).length,
      weekAvg,
      bestDay: chart.length ? chart.reduce((a, b) => a.persen > b.persen ? a : b) : null,
    },
  })
})

const APP_RELEASE_DATE = process.env.APP_RELEASE_DATE || '2026-07-13'

server.get('/api/dashboard/month', (req, res) => {
  const tahun = parseInt(req.query.tahun) || new Date().getFullYear()
  const bulan = parseInt(req.query.bulan) || (new Date().getMonth() + 1)
  const userId = req.query.userId || null
  const todayStr = new Date().toISOString().split('T')[0]
  let a = router.db.get('absensi').value()
  let p = router.db.get('pengajuan').value()
  if (userId) {
    a = a.filter((x) => x.userId === userId)
    p = p.filter((x) => x.userId === userId)
  }
  const u = router.db.get('users').value()
  const total = userId ? 1 : u.filter((x) => x.role === 'karyawan').length

  const daysInMonth = new Date(tahun, bulan, 0).getDate()
  const data = []

  for (let d = 1; d <= daysInMonth; d++) {
    const tgl = `${tahun}-${String(bulan).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    if (tgl < APP_RELEASE_DATE || tgl > todayStr) {
      data.push({ tanggal: tgl, hadir: 0, terlambat: 0, checkInOnly: 0, izin: 0, tidakHadir: 0 })
      continue
    }

    const dayAbsensi = a.filter((x) => x.tanggal === tgl)
    const dayPengajuan = p.filter((x) => x.status === 'approved' && x.tanggalMulai <= tgl && x.tanggalSelesai >= tgl)
    const hadir = dayAbsensi.filter((x) => ['hadir', 'pulang_cepat'].includes(x.status)).length
    const terlambat = dayAbsensi.filter((x) => x.status === 'terlambat').length
    const checkInOnly = dayAbsensi.filter((x) => x.checkIn && !x.checkOut).length
    const izin = dayAbsensi.filter((x) => ['izin', 'sakit', 'cuti'].includes(x.status)).length
    const pengajuanIzin = dayPengajuan.length
    const totalIzin = izin + pengajuanIzin
    data.push({
      tanggal: tgl,
      hadir,
      terlambat,
      checkInOnly,
      izin: totalIzin,
      tidakHadir: Math.max(0, total - hadir - terlambat - checkInOnly - totalIzin),
    })
  }

  res.json({ data, totalKaryawan: total })
})

server.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err?.message || err, err?.stack || '')
  res.status(500).json({ message: 'Internal server error: ' + (err?.message || 'unknown') })
})

server.use(async (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  if (req.method === 'GET' && (req.path === '/' || req.path.startsWith('/uploads/'))) return next()
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  if (!session) return res.status(401).json({ message: 'Unauthorized' })
  next()
})

server.use(router)

const PORT = process.env.PORT || 3001
normalizeDbFile()
syncSeedUsers().then(() => {
  server.listen(PORT, () => { console.log(`Mock API running at http://localhost:${PORT}`) })
})
