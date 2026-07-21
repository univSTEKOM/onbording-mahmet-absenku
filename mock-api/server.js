const jsonServer = require('json-server')
const multer = require('multer')

const upload = multer()
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

server.use(upload.none())
server.use(jsonServer.bodyParser)
server.use(middlewares)

server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = router.db
    .get('users')
    .find({ email, password })
    .value()

  if (!user) {
    return res.status(401).json({ message: 'Email atau password salah' })
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({
    user: userWithoutPassword,
    token: 'fake-jwt-' + Date.now(),
  })
})

server.post('/api/auth/register', (req, res) => {
  const { email, password, nama, jabatan, phone } = req.body
  const users = router.db.get('users').value()

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: 'Email sudah terdaftar' })
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    email,
    password,
    nama,
    jabatan: jabatan || '',
    role: 'karyawan',
    foto: '',
    phone: phone || '',
    alamat: '',
    createdAt: new Date().toISOString(),
  }

  router.db.get('users').push(newUser).write()

  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json({
    user: userWithoutPassword,
    token: 'fake-jwt-' + Date.now(),
  })
})

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
    return res.status(400).json({
      message: `Belum waktunya absen. Absensi dibuka pukul ${CHECK_IN_START}.`,
    })
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

server.delete('/pengajuan/:id', (req, res) => {
  const record = router.db.get('pengajuan').find({ id: Number(req.params.id) }).value()
  if (!record) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' })
  if (record.status !== 'pending') return res.status(400).json({ message: 'Hanya pengajuan pending yang bisa dihapus' })
  router.db.get('pengajuan').remove({ id: Number(req.params.id) }).write()
  res.status(200).json({ message: 'Dihapus' })
})

server.patch('/users/:id', (req, res, next) => {
  const body = req.body
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).json({ message: 'Format email tidak valid' })
  }
  if (body.nama && body.nama.length > 100) {
    return res.status(400).json({ message: 'Nama maksimal 100 karakter' })
  }
  if (body.jabatan && body.jabatan.length > 100) {
    return res.status(400).json({ message: 'Jabatan maksimal 100 karakter' })
  }
  next()
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

server.use(router)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
})
