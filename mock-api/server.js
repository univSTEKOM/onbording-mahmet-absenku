import cors from 'cors'
import fs from 'fs'
import { createRequire } from 'module'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth.js'

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
    const db = JSON.parse(dbRaw)
    const seedUsers = db.users || []
    let synced = 0

    for (const seed of seedUsers) {
      try {
        const result = await auth.api.signUpEmail({
          body: {
            email: seed.email,
            password: seed.password,
            name: seed.nama,
            role: seed.role || 'karyawan',
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
            id: newId,
            email: seed.email,
            password: seed.password,
            nama: seed.nama,
            jabatan: seed.jabatan || '',
            role: seed.role || 'karyawan',
            status: seed.status || 'approved',
            foto: '',
            phone: seed.phone || '',
            alamat: seed.alamat || '',
            createdAt: new Date().toISOString(),
          }).write()
        }
        synced++
      } catch (e) {
        /* user already exists */
      }
    }
    console.log(`Sync: ${synced} seed users synced`)
  } catch (e) {
    console.error('Sync error:', e.message)
  }
}

server.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

const loginAttempts = new Map()
const MAX_LOGIN_ATTEMPTS = 3
const BASE_BLOCK_DURATION = 30000
const MAX_BLOCK_DURATION = 120000

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

      if (record && record.count >= MAX_LOGIN_ATTEMPTS) {
        const elapsed = now - record.blockedAt
        if (elapsed < record.duration) {
          const remaining = Math.ceil((record.duration - elapsed) / 1000)
          return res.status(429).json({
            message: `Terlalu banyak percobaan. Coba lagi ${remaining} detik lagi.`,
            remaining,
          })
        }
        loginAttempts.delete(key)
      }

      const originalJson = res.json.bind(res)
      res.json = function (data) {
        if (data?.token || data?.user) {
          loginAttempts.delete(key)
        } else {
          let attempt = loginAttempts.get(key)
          if (!attempt) {
            attempt = { count: 0 }
            loginAttempts.set(key, attempt)
          }
          attempt.count++
          if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
            attempt.blockedAt = now
            attempt.duration = Math.min(
              BASE_BLOCK_DURATION + (attempt.count - MAX_LOGIN_ATTEMPTS) * 15000,
              MAX_BLOCK_DURATION
            )
          }
        }
        return originalJson(data)
      }

      req.body = parsed
      next()
    } catch { next() }
  })
})

server.all('/api/auth/*', toNodeHandler(auth))

server.post('/api/register', async (req, res) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body)
      const { email, password, phone } = parsed
      const nama = parsed.nama || parsed.name || ''
      const jabatan = parsed.jabatan || ''
      const role = parsed.role || 'karyawan'

      if (!email || !password || !nama) {
        return res.status(400).json({ message: 'Email, password, dan nama harus diisi' })
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' })
      }
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password minimal 8 karakter' })
      }
      if (nama.length > 100) {
        return res.status(400).json({ message: 'Nama maksimal 100 karakter' })
      }
      if (jabatan && jabatan.length > 100) {
        return res.status(400).json({ message: 'Jabatan maksimal 100 karakter' })
      }

      /* deteksi admin-add: cek session */
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      })
      const isAdminAction = session?.user?.role === 'admin'
      const effectiveRole = isAdminAction ? role : 'karyawan'
      const effectiveStatus = isAdminAction ? 'approved' : 'pending'

      const response = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: nama,
          role: effectiveRole,
          jabatan: jabatan || '',
          phone: phone || '',
          alamat: '',
        },
        asResponse: true,
      })

      if (response.status !== 200) {
        const err = await response.json()
        return res.status(400).json({ message: err.message || 'Gagal mendaftar' })
      }

      const data = await response.json()
      const profile = {
        id: data.user.id,
        email,
        nama,
        jabatan: jabatan || '',
        role: effectiveRole,
        status: effectiveStatus,
        rejectionNotes: [],
        foto: '',
        phone: phone || '',
        alamat: '',
        createdAt: new Date().toISOString(),
      }
      router.db.get('users').push(profile).write()
      res.status(201).json({ user: { ...data.user, ...profile } })
    } catch (e) {
      res.status(400).json({ message: e.message || 'Gagal mendaftar' })
    }
  })
})

server.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  if (!session) return res.status(401).json({ message: 'Unauthorized' })

  const profile = router.db.get('users').find({ email: session.user.email }).value()
  res.json({
    ...session,
    user: { ...session.user, ...profile },
  })
})

async function requireAdmin(headers) {
  const session = await auth.api.getSession({ headers })
  if (!session) return { error: { status: 401, message: 'Unauthorized' } }
  if (session.user.role !== 'admin') return { error: { status: 403, message: 'Forbidden' } }
  return { session }
}

server.patch('/api/users/:id/status', async (req, res) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', async () => {
    try {
      const { error } = await requireAdmin(fromNodeHeaders(req.headers))
      if (error) return res.status(error.status).json({ message: error.message })

      const { status: newStatus, note } = JSON.parse(body)
      if (!['approved', 'rejected'].includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid status. Gunakan approved atau rejected' })
      }

      const user = router.db.get('users').find({ id: req.params.id }).value()
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

      router.db.get('users').chain.find({ id: req.params.id }).assign({ status: newStatus }).write()

      if (newStatus === 'rejected' && note) {
        const notes = user.rejectionNotes || []
        notes.push({ note, createdAt: new Date().toISOString() })
        router.db.get('users').chain.find({ id: req.params.id }).assign({ rejectionNotes: notes }).write()
      }

      if (newStatus === 'approved') {
        router.db.get('users').chain.find({ id: req.params.id }).assign({ rejectionNotes: [] }).write()
      }

      res.json({ message: `Status berhasil diubah ke ${newStatus}` })
    } catch { res.status(400).json({ message: 'Gagal memproses' }) }
  })
})

server.post('/api/users/:id/notes', async (req, res) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', async () => {
    try {
      const { error } = await requireAdmin(fromNodeHeaders(req.headers))
      if (error) return res.status(error.status).json({ message: error.message })

      const { note } = JSON.parse(body)
      if (!note) return res.status(400).json({ message: 'Catatan harus diisi' })

      const user = router.db.get('users').find({ id: req.params.id }).value()
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

      const notes = user.rejectionNotes || []
      notes.push({ note, createdAt: new Date().toISOString() })
      router.db.get('users').chain.find({ id: req.params.id }).assign({ rejectionNotes: notes }).write()

      res.json({ message: 'Catatan ditambahkan' })
    } catch { res.status(400).json({ message: 'Gagal memproses' }) }
  })
})

server.delete('/api/users/:id', async (req, res) => {
  const { error } = await requireAdmin(fromNodeHeaders(req.headers))
  if (error) return res.status(error.status).json({ message: error.message })

  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

  router.db.get('users').remove({ id: req.params.id }).write()
  router.db.get('absensi').remove({ userId: req.params.id }).write()
  router.db.get('pengajuan').remove({ userId: req.params.id }).write()
  res.json({ message: 'User dan semua data terkait berhasil dihapus' })
})

server.get('/api/users/pending', async (req, res) => {
  const { error } = await requireAdmin(fromNodeHeaders(req.headers))
  if (error) return res.status(error.status).json({ message: error.message })

  const users = router.db.get('users').filter((u) => u.status === 'pending').value()
  res.json(users)
})

server.get('/api/users/all', async (req, res) => {
  const { error } = await requireAdmin(fromNodeHeaders(req.headers))
  if (error) return res.status(error.status).json({ message: error.message })

  const users = router.db.get('users').value()
  res.json(users)
})

server.use(upload.none())
server.use(jsonServer.bodyParser)
server.use(middlewares)

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function nowTime() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

const CHECK_IN_START = '06:45'
const CHECK_IN_END = '07:45'
const CHECK_OUT_MIN = '16:00'

server.post('/absensi', (req, res, next) => {
  const time = nowTime()
  const mins = toMinutes(time)
  if (mins < toMinutes(CHECK_IN_START)) {
    return res.status(400).json({ message: `Belum waktunya absen. Absensi dibuka pukul ${CHECK_IN_START}.` })
  }
  const existing = router.db.get('absensi').find({ userId: req.body.userId, tanggal: req.body.tanggal }).value()
  if (existing) {
    return res.status(400).json({ message: 'Anda sudah melakukan absensi hari ini' })
  }
  req.body.status = mins <= toMinutes(CHECK_IN_END) ? 'hadir' : 'terlambat'
  next()
})

server.patch('/absensi/:id', (req, res, next) => {
  if (!req.body.checkOut) return next()
  const time = nowTime()
  const mins = toMinutes(time)
  if (mins < toMinutes(CHECK_OUT_MIN)) {
    req.body.status = 'pulang_cepat'
  }
  next()
})

server.patch('/users/:id', (req, res, next) => {
  const body = req.body

  /* 🚫 Security: jangan biarkan client set field ini */
  delete body.status
  delete body.rejectionNotes
  delete body.role
  delete body.id
  delete body.createdAt

  if (body.email !== undefined) {
    if (!body.email.trim()) return res.status(400).json({ message: 'Email tidak boleh kosong' })
    if (body.email.length > 100) return res.status(400).json({ message: 'Email maksimal 100 karakter' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return res.status(400).json({ message: 'Format email tidak valid' })
  }
  if (body.nama !== undefined) {
    if (!body.nama.trim()) return res.status(400).json({ message: 'Nama tidak boleh kosong' })
    if (body.nama.length > 100) return res.status(400).json({ message: 'Nama maksimal 100 karakter' })
  }
  if (body.jabatan !== undefined) {
    if (!body.jabatan.trim()) return res.status(400).json({ message: 'Jabatan tidak boleh kosong' })
    if (body.jabatan.length > 100) return res.status(400).json({ message: 'Jabatan maksimal 100 karakter' })
  }
  if (body.phone !== undefined && body.phone) {
    const digits = body.phone.replace(/\D/g, '')
    if (digits.length < 10) return res.status(400).json({ message: 'Nomor telepon minimal 10 digit' })
    if (digits.length > 15) return res.status(400).json({ message: 'Nomor telepon maksimal 15 digit' })
  }
  if (body.alamat !== undefined && body.alamat.length > 500) {
    return res.status(400).json({ message: 'Alamat maksimal 500 karakter' })
  }

  /* ✅ Auto-reset: jika user rejected dan update profil → pending lagi */
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (user && user.status === 'rejected') {
    router.db.get('users').chain.find({ id: req.params.id }).assign({ status: 'pending', rejectionNotes: [] }).write()
  }

  next()
})

server.delete('/users/:id', (req, res) => {
  res.status(403).json({ message: 'Gunakan endpoint admin: DELETE /api/users/:id' })
})

server.patch('/pengajuan/:id', (req, res, next) => {
  const record = router.db.get('pengajuan').find({ id: Number(req.params.id) }).value()
  if (!record) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' })
  if (req.body.status && record.status !== 'pending') {
    return res.status(400).json({ message: 'Pengajuan sudah diproses sebelumnya' })
  }
  if (req.body.alasan && req.body.alasan.length > 500) {
    return res.status(400).json({ message: 'Alasan maksimal 500 karakter' })
  }
  next()
})

server.get('/api/dashboard/recent', (req, res) => {
  const userId = req.query.userId ? req.query.userId : null
  let absensi = router.db.get('absensi').value()
  if (userId) absensi = absensi.filter((a) => a.userId === userId)
  const uniqueDates = [...new Set(absensi.map((a) => a.tanggal))].sort()
  const last7 = uniqueDates.slice(-7)
  const result = last7.map((tanggal) => {
    const records = absensi.filter((a) => a.tanggal === tanggal)
    return { tanggal, checkIn: records[0]?.checkIn || null, checkOut: records[0]?.checkOut || null, status: records[0]?.status || null }
  })
  res.json({ data: result })
})

server.get('/api/dashboard/hrd/week', (req, res) => {
  const absensi = router.db.get('absensi').value()
  const users = router.db.get('users').value()
  const karyawan = users.filter((u) => u.role === 'karyawan')
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(); monthStart.setDate(1)
  const monthStr = monthStart.toISOString().split('T')[0]

  const uniqueDates = [...new Set(absensi.map((a) => a.tanggal))].sort()
  const last7 = uniqueDates.slice(-7)
  const chart = last7.map((date) => {
    const dayAbsensi = absensi.filter((a) => a.tanggal === date)
    return {
      name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
      hadir: dayAbsensi.filter((a) => a.status === 'hadir').length,
      terlambat: dayAbsensi.filter((a) => a.status === 'terlambat').length,
      persen: Math.round((dayAbsensi.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length / karyawan.length) * 100),
    }
  })

  const todayAbsensi = absensi.filter((a) => a.tanggal === today)
  const monthAbsensi = absensi.filter((a) => a.tanggal >= monthStr)
  const weekAvg = chart.length > 0 ? Math.round(chart.reduce((s, d) => s + d.persen, 0) / chart.length) : 0

  res.json({
    chart,
    summary: {
      totalKaryawan: karyawan.length,
      hadirHariIni: todayAbsensi.filter((a) => a.status === 'hadir').length,
      terlambatHariIni: todayAbsensi.filter((a) => a.status === 'terlambat').length,
      izinHariIni: todayAbsensi.filter((a) => ['izin', 'sakit', 'cuti'].includes(a.status)).length,
      belumAbsen: karyawan.length - todayAbsensi.filter((a) => a.checkIn).length,
      totalAbsensiBulanIni: monthAbsensi.length,
      weekAvg,
      bestDay: chart.length > 0 ? chart.reduce((a, b) => (a.persen > b.persen ? a : b), chart[0]) : null,
    },
  })
})

server.use(router)

const PORT = process.env.PORT || 3001
syncSeedUsers().then(() => {
  server.listen(PORT, () => {
    console.log(`Mock API running at http://localhost:${PORT}`)
  })
})
