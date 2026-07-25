import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'

if (existsSync('./auth.db')) {
  unlinkSync('./auth.db')
  console.log('Deleted existing auth.db')
}

const { auth } = await import('./auth.js')
const { getMigrations } = await import('better-auth/db/migration')

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
console.log('Migrations applied')

var DEV_PASSWORD = process.env.DEMO_PASSWORD || 'password'

const demoUsers = [
  { email: "andika@stekom.ac.id", password: DEV_PASSWORD, name: "Andika", role: "admin", jabatan: "Manager HRD", phone: "081234567890", alamat: "Jl. Merdeka No. 1, Jakarta", status: "approved" },
  { email: "rudi@stekom.ac.id", password: DEV_PASSWORD, name: "Rudi Hartono", role: "karyawan", jabatan: "Staff IT", phone: "081234567891", alamat: "Jl. Sudirman No. 2, Jakarta", status: "approved" },
  { email: "siti@stekom.ac.id", password: DEV_PASSWORD, name: "Siti Nurhaliza", role: "karyawan", jabatan: "Staff Keuangan", phone: "081234567892", alamat: "Jl. Gatot Subroto No. 3, Jakarta", status: "approved" },
  { email: "budi@stekom.ac.id", password: DEV_PASSWORD, name: "Budi Santoso", role: "karyawan", jabatan: "Staff Baru", phone: "081234567893", alamat: "Jl. Baru No. 1, Jakarta", status: "pending" },
]

const createdUsers = []

for (const user of demoUsers) {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        status: user.status,
        jabatan: user.jabatan,
        phone: user.phone,
        alamat: user.alamat,
      },
      asResponse: true,
    })
    const data = await response.json()
    createdUsers.push({ ...user, id: data.user.id })
    console.log(`Created: ${user.email} -> ${data.user.id}`)
  } catch (e) {
    console.log(`Error creating ${user.email}: ${e.message}`)
  }
}

const dbJson = JSON.parse(readFileSync('./db.json', 'utf-8'))

dbJson.users = createdUsers.map((u) => ({
  id: u.id,
  email: u.email,
  nama: u.name,
  jabatan: u.jabatan,
  role: u.role,
  status: u.status,
  rejectionNotes: [],
  foto: '',
  faceDescriptor: '',
  phone: u.phone,
  alamat: u.alamat,
  createdAt: new Date().toISOString(),
}))

const [andika, rudi, siti, budi] = createdUsers

dbJson.absensi = [
  { id: 1,  userId: rudi.id, tanggal: "2026-07-13", checkIn: "2026-07-13T08:00:00Z", checkOut: "2026-07-13T17:00:00Z", status: "hadir", mainCategory: "physical_present", subCategory: "physical_standard", faceVerified: true, keterangan: "", createdAt: "2026-07-13T08:00:00Z" },
  { id: 2,  userId: rudi.id, tanggal: "2026-07-14", checkIn: "2026-07-14T08:15:00Z", checkOut: "2026-07-14T17:00:00Z", status: "terlambat", mainCategory: "physical_present", subCategory: "physical_violation", faceVerified: true, keterangan: "", createdAt: "2026-07-14T08:15:00Z" },
  { id: 3,  userId: siti.id, tanggal: "2026-07-13", checkIn: "2026-07-13T07:55:00Z", checkOut: "2026-07-13T16:30:00Z", status: "hadir", mainCategory: "physical_present", subCategory: "physical_standard", faceVerified: true, keterangan: "", createdAt: "2026-07-13T07:55:00Z" },
  { id: 4,  userId: siti.id, tanggal: "2026-07-14", checkIn: "2026-07-14T08:00:00Z", checkOut: null, status: "hadir", mainCategory: "physical_present", subCategory: "physical_standard", faceVerified: false, keterangan: "", createdAt: "2026-07-14T08:00:00Z" },
  { id: 5,  userId: rudi.id, tanggal: "2026-07-15", checkIn: "2026-07-15T08:00:00Z", checkOut: "2026-07-15T17:00:00Z", status: "hadir", mainCategory: "physical_present", subCategory: "physical_standard", faceVerified: true, keterangan: "", createdAt: "2026-07-15T08:00:00Z" },
  { id: 6,  userId: rudi.id, tanggal: "2026-07-16", checkIn: "2026-07-16T08:00:00Z", checkOut: "2026-07-16T17:00:00Z", status: "hadir", mainCategory: "physical_present", subCategory: "physical_standard", faceVerified: true, keterangan: "", createdAt: "2026-07-16T08:00:00Z" },
  { id: 7,  userId: rudi.id, tanggal: "2026-07-17", checkIn: "2026-07-17T08:00:00Z", checkOut: "2026-07-17T17:00:00Z", status: "hadir", mainCategory: "physical_present", subCategory: "physical_standard", faceVerified: true, keterangan: "", createdAt: "2026-07-17T08:00:00Z" },
]

dbJson.pengajuan = [
  { id: 1, userId: rudi.id, jenis: "cuti", tanggalMulai: "2026-07-25", tanggalSelesai: "2026-07-27", alasan: "Acara keluarga", status: "approved", catatan: "Disetujui", createdAt: "2026-07-18T10:00:00Z" },
  { id: 2, userId: siti.id, jenis: "izin", tanggalMulai: "2026-07-21", tanggalSelesai: "2026-07-21", alasan: "Keperluan bank", status: "approved", catatan: "Disetujui", createdAt: "2026-07-17T09:00:00Z" },
]

writeFileSync('./db.json', JSON.stringify(dbJson, null, 2))
console.log('db.json updated with seed data')
