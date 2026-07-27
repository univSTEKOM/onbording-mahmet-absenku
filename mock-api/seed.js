import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'

/* ── Reset auth.db setiap seed ── */
if (existsSync('./auth.db')) {
  try {
    unlinkSync('./auth.db')
    console.log('Deleted existing auth.db')
  } catch (_e) {
    console.log('auth.db in use, skipping delete (server mungkin sedang berjalan)')
  }
}

const { auth } = await import('./auth.js')
const { getMigrations } = await import('better-auth/db/migration')
const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
console.log('Migrations applied')

const DEV_PASSWORD = process.env.DEMO_PASSWORD || 'password'
const APP_RELEASE = '2026-07-13'
const TODAY = new Date()
const TODAY_STR = TODAY.toISOString().split('T')[0]

/* ── Random helpers ── */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function pick(arr) { return arr[rand(0, arr.length - 1)] }

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0)
  let r = Math.random() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.value
  }
  return items[items.length - 1].value
}

function randTime(baseHour, baseMin, spreadMin) {
  const totalMin = rand(0, spreadMin)
  const d = new Date(0)
  d.setHours(baseHour, baseMin + totalMin, rand(0, 59), 0)
  return d
}

function toISO(tgl, time) {
  return `${tgl}T${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}.000Z`
}

function isWeekend(tgl) {
  const d = new Date(tgl + 'T00:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

function eachDay(from, to) {
  const days = []
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    const tgl = d.toISOString().split('T')[0]
    days.push(tgl)
    d.setDate(d.getDate() + 1)
  }
  return days
}

/* ── Status → category mapping ── */
const CAT_MAP = {
  hadir:        { main: 'physical_present', sub: 'physical_standard' },
  terlambat:    { main: 'physical_present', sub: 'physical_violation' },
  pulang_cepat: { main: 'physical_present', sub: 'physical_violation' },
  izin:         { main: 'absent_permit',    sub: 'permit_official' },
  sakit:        { main: 'absent_permit',    sub: 'permit_health' },
  cuti:         { main: 'absent_permit',    sub: 'permit_annual' },
}

/* ── User personas ── */
const PERSONAS = [
  {
    email: 'andika@stekom.ac.id', name: 'Andika', role: 'admin',
    jabatan: 'Manager HRD', phone: '+6281234567890', alamat: 'Jl. Merdeka No. 1, Jakarta',
    status: 'approved',
    weights: null,
  },
  {
    email: 'rudi@stekom.ac.id', name: 'Rudi Hartono', role: 'karyawan',
    jabatan: 'Staff IT', phone: '+6281234567891', alamat: 'Jl. Sudirman No. 2, Jakarta',
    status: 'approved',
    weights: { hadir: 80, terlambat: 5, pulang_cepat: 10, izin: 3, sakit: 2, cuti: 0, tidakHadir: 0 },
    desc: 'rajin — selalu hadir tepat waktu',
  },
  {
    email: 'siti@stekom.ac.id', name: 'Siti Nurhaliza', role: 'karyawan',
    jabatan: 'Staff Keuangan', phone: '+6281234567892', alamat: 'Jl. Gatot Subroto No. 3, Jakarta',
    status: 'approved',
    weights: { hadir: 20, terlambat: 60, pulang_cepat: 5, izin: 5, sakit: 5, cuti: 0, tidakHadir: 5 },
    desc: 'sering telat — sering datang setelah 07:45',
  },
  {
    email: 'budi@stekom.ac.id', name: 'Budi Santoso', role: 'karyawan',
    jabatan: 'Staff Baru', phone: '+6281234567893', alamat: 'Jl. Baru No. 1, Jakarta',
    status: 'pending',
    weights: { hadir: 20, terlambat: 10, pulang_cepat: 5, izin: 5, sakit: 5, cuti: 0, tidakHadir: 55 },
    desc: 'malas — sering tidak hadir (pending)',
  },
  {
    email: 'dewi@stekom.ac.id', name: 'Dewi Sartika', role: 'karyawan',
    jabatan: 'Staff Marketing', phone: '+6281234567894', alamat: 'Jl. Asia Afrika No. 4, Bandung',
    status: 'approved',
    weights: { hadir: 30, terlambat: 5, pulang_cepat: 5, izin: 40, sakit: 10, cuti: 0, tidakHadir: 10 },
    desc: 'sering izin — sering mengajukan izin',
  },
  {
    email: 'ani@stekom.ac.id', name: 'Ani Mahmudah', role: 'karyawan',
    jabatan: 'Staff HR', phone: '+6281234567895', alamat: 'Jl. Diponegoro No. 5, Jakarta',
    status: 'approved',
    weights: { hadir: 85, terlambat: 5, pulang_cepat: 5, izin: 3, sakit: 2, cuti: 0, tidakHadir: 0 },
    desc: 'rajin 2 — hadir hampir tiap hari, kadang telat sedikit',
  },
  {
    email: 'tono@stekom.ac.id', name: 'Tono Widodo', role: 'karyawan',
    jabatan: 'Staff Gudang', phone: '+6281234567896', alamat: 'Jl. Pahlawan No. 6, Surabaya',
    status: 'approved',
    weights: { hadir: 40, terlambat: 10, pulang_cepat: 40, izin: 3, sakit: 2, cuti: 0, tidakHadir: 5 },
    desc: 'pulang cepat — sering check out sebelum 16:00',
  },
  {
    email: 'ferry@stekom.ac.id', name: 'Ferry Gunawan', role: 'karyawan',
    jabatan: 'Staff Magang', phone: '+6281234567897', alamat: 'Jl. Merapi No. 7, Yogyakarta',
    status: 'pending',
    weights: { hadir: 60, terlambat: 10, pulang_cepat: 10, izin: 5, sakit: 5, cuti: 0, tidakHadir: 10 },
    desc: 'baru — pending, beberapa absensi awal',
  },
]

/* ── Create users di better-auth + db.json ── */
const createdUsers = []

for (const p of PERSONAS) {
  let userId = null
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: p.email, password: DEV_PASSWORD, name: p.name,
        role: p.role, status: p.status, jabatan: p.jabatan,
        phone: p.phone, alamat: p.alamat,
      },
      asResponse: true,
    })
    const data = await response.json()
    userId = data?.user?.id || null
    if (userId) {
      console.log(`Created: ${p.email} -> ${userId}`)
    } else {
      /* Response sukses tapi format tidak sesuai */
      console.log(`Partial: ${p.email} — response ok tapi no userId`)
    }
  } catch (e) {
    console.log(`Already exists: ${p.email}`)
  }
  if (!userId) {
    /* Placeholder — server.js syncSeedUsers akan update ID asli saat startup */
    userId = 'seed-' + p.email.replace(/[^a-z]/g, '')
    console.log(`Temp ID for ${p.email}: ${userId}`)
  }
  createdUsers.push({ ...p, id: userId })
}

/* ── Build db.json ── */
const dbJson = { absensi: [], pengajuan: [] }

dbJson.users = createdUsers.map((u) => ({
  id: u.id, email: u.email, nama: u.name, jabatan: u.jabatan,
  role: u.role, status: u.status, rejectionNotes: [],
  foto: '', faceDescriptor: '', phone: u.phone, alamat: u.alamat,
  createdAt: new Date().toISOString(),
}))

/* ── Generate absensi ── */
const workDays = eachDay(APP_RELEASE, TODAY_STR).filter((tgl) => !isWeekend(tgl))
let absId = 1

for (const u of createdUsers) {
  if (!u.weights) continue

  for (const tgl of workDays) {
    const status = pickWeighted(
      Object.entries(u.weights).map(([k, w]) => ({ weight: w, value: k }))
    )

    if (status === 'tidakHadir') continue

    const checkInHour = status === 'terlambat' ? rand(7, 8) + 1 : 7
    const checkInMin = status === 'terlambat' ? rand(50, 59) : rand(0, 40)
    const checkInSec = rand(0, 59)
    const checkIn = new Date(tgl + 'T' +
      String(checkInHour).padStart(2, '0') + ':' +
      String(checkInMin).padStart(2, '0') + ':' +
      String(checkInSec).padStart(2, '0') + '.000Z')

    const isPulangCepat = status === 'pulang_cepat'
    const checkOutHour = isPulangCepat ? rand(13, 15) : rand(16, 17)
    const checkOutMin = rand(10, 50)
    const checkOut = new Date(tgl + 'T' +
      String(checkOutHour).padStart(2, '0') + ':' +
      String(checkOutMin).padStart(2, '0') + ':' +
      String(rand(0, 59)).padStart(2, '0') + '.000Z')

    const cat = CAT_MAP[status]
    const faceVerified = Math.random() < 0.7

    dbJson.absensi.push({
      id: absId++,
      userId: u.id,
      tanggal: tgl,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      status,
      mainCategory: cat.main,
      subCategory: cat.sub,
      faceVerified,
      photos: [],
      keterangan: '',
      createdAt: checkIn.toISOString(),
    })
  }
}

console.log(`Generated ${dbJson.absensi.length} absensi records`)

/* ── Generate pengajuan ── */
const dewi = createdUsers.find((u) => u.email.startsWith('dewi'))
const rudi = createdUsers.find((u) => u.email.startsWith('rudi'))
const siti = createdUsers.find((u) => u.email.startsWith('siti'))

const pengajuanList = [
  { userId: rudi?.id, jenis: 'cuti', tglMulai: '2026-07-28', tglSelesai: '2026-07-30', alasan: 'Acara keluarga', status: 'approved' },
  { userId: siti?.id, jenis: 'izin', tglMulai: '2026-07-22', tglSelesai: '2026-07-22', alasan: 'Keperluan bank', status: 'approved' },
  { userId: dewi?.id, jenis: 'izin', tglMulai: '2026-07-15', tglSelesai: '2026-07-15', alasan: 'Periksa kesehatan', status: 'approved' },
  { userId: dewi?.id, jenis: 'sakit', tglMulai: '2026-07-20', tglSelesai: '2026-07-21', alasan: 'Demam', status: 'approved' },
  { userId: rudi?.id, jenis: 'cuti', tglMulai: '2026-08-01', tglSelesai: '2026-08-03', alasan: 'Liburan tahunan', status: 'pending' },
]

let pengId = 1
for (const p of pengajuanList) {
  if (!p.userId) continue
  dbJson.pengajuan.push({
    id: pengId++,
    userId: p.userId,
    jenis: p.jenis,
    tanggalMulai: p.tglMulai,
    tanggalSelesai: p.tglSelesai,
    alasan: p.alasan,
    status: p.status,
    catatan: p.status === 'approved' ? 'Disetujui' : '',
    createdAt: new Date().toISOString(),
  })
}

console.log(`Generated ${dbJson.pengajuan.length} pengajuan records`)

/* ── Write db.json ── */
writeFileSync('./db.json', JSON.stringify(dbJson, null, 2))
console.log('db.json updated — seed selesai')
