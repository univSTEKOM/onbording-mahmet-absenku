const fs = require('fs')
const path = require('path')
const jsonServer = require('json-server')
const multer = require('multer')

const upload = multer()
const server = jsonServer.create()
const dbPath = path.join(__dirname, 'db.json')
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(upload.none())
server.use(jsonServer.bodyParser)

server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  const user = db.users.find(
    (u) => u.email === email && u.password === password
  )

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
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

  if (db.users.find((u) => u.email === email)) {
    return res.status(400).json({ message: 'Email sudah terdaftar' })
  }

  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
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

  db.users.push(newUser)
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json({
    user: userWithoutPassword,
    token: 'fake-jwt-' + Date.now(),
  })
})

server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
})
