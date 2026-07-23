# Mock API

Server API palsu untuk development frontend. Berbasis json-server dengan Express middleware dan better-auth untuk autentikasi.

## Cara Menjalankan

```bash
cd mock-api
bun start       # atau npm start — Server di http://localhost:3001
```

## Database

**db.json** — file JSON sebagai database utama. Berisi 3 tabel:

| Collection | Isi |
|---|---|
| `users` | Data profil pengguna (4 user: 1 admin, 2 karyawan aktif, 1 pending) |
| `absensi` | Riwayat absensi (7 record, 6 untuk Rudi, 1 untuk Siti) |
| `pengajuan` | Pengajuan cuti/izin (2 record, sudah approved) |

**auth.db** — SQLite untuk better-auth (session, akun, password hash).

## Autentikasi

Menggunakan **better-auth** dengan HTTP-only cookie session.

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/auth/sign-in/email` | POST | Login dengan email + password |
| `/api/auth/sign-out` | POST | Logout, hapus session |
| `/api/auth/session` | GET | Cek session yang aktif |

### Demo Akun

| Email | Password | Role |
|---|---|---|
| andika@stekom.ac.id | password | Admin |
| rudi@stekom.ac.id | password | Karyawan |
| siti@stekom.ac.id | password | Karyawan |
| budi@stekom.ac.id | password | Karyawan (pending) |

## Rate Limiting

- 3x gagal login → blokir sementara (30 detik)
- Blokir bertambah 15 detik per percobaan tambahan
- Maksimal blokir: 120 detik
