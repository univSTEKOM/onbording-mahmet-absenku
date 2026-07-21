# Route & Navigation Plan

## 1. Frontend Routes (React Router v6)

### 1.1. Route Structure

```
Path                          Page Component         Auth     Layout
──────────────────────────────────────────────────────────────────────
/login                        LoginPage              Public   AuthLayout
/register                     RegisterPage           Public   AuthLayout
/                             → redirect ke /dashboard
/dashboard                    DashboardPage          Karyawan MainLayout
/hrd/dashboard                HrdDashboardPage       Admin    MainLayout
/absensi                      AbsensiPage            Karyawan MainLayout
/absensi/riwayat              RiwayatPage            Karyawan MainLayout
/pengajuan                    PengajuanListPage      Karyawan MainLayout
/pengajuan/baru               PengajuanFormPage      Karyawan MainLayout
/profil                       ProfilPage             Karyawan+Admin MainLayout
```

### 1.2. Route Guard Logic

- **Public routes**: `/login`, `/register` — redirect ke `/dashboard` jika sudah login
- **Protected routes**: Semua route di bawah MainLayout — redirect ke `/login` jika belum login
- **Admin-only routes**: `/hrd/*` — redirect ke `/dashboard` jika role = "karyawan"

## 2. API Endpoints (json-server)

### 2.1. Auth (custom logic via json-server middleware)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | /api/auth/login | { email, password } | { user, token: "fake-jwt-xxx" } |
| POST | /api/auth/register | { email, password, nama, jabatan } | { user } |

> Auth endpoints tidak native json-server, perlu ditangani via `server.js` (custom middleware atau Express wrapper)

### 2.2. Users

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /users | List semua users |
| GET | /users/:id | Detail user |
| PATCH | /users/:id | Update profil user |

### 2.3. Absensi

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /absensi | List absensi (support `?userId=`, `?tanggal=`, `_sort`, `_order`) |
| GET | /absensi/:id | Detail absensi |
| POST | /absensi | Check-in (create record) |
| PATCH | /absensi/:id | Check-out (update checkOut) |
| GET | /absensi?userId=1&_sort=tanggal&_order=desc | Riwayat per user, sorted |

### 2.4. Pengajuan

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /pengajuan | List pengajuan (support `?userId=`, `?status=`) |
| GET | /pengajuan/:id | Detail pengajuan |
| POST | /pengajuan | Buat pengajuan baru |
| PATCH | /pengajuan/:id | Update status (approve/reject oleh admin) |
| DELETE | /pengajuan/:id | Hapus pengajuan (hanya yg masih pending) |

### 2.5. Query Parameters (json-server native)

| Parameter | Contoh | Kegunaan |
|---|---|---|
| `_sort` | `_sort=tanggal` | Sort by field |
| `_order` | `_order=desc` | Ascending/descending |
| `userId` | `userId=2` | Filter by user |
| `status` | `status=pending` | Filter by status |
| `tanggal_gte` | `tanggal_gte=2026-07-01` | Filter date range (>=) |
| `tanggal_lte` | `tanggal_lte=2026-07-31` | Filter date range (<=) |
| `_page` & `_limit` | `_page=1&_limit=10` | Pagination |
| `q` | `q=andi` | Full-text search |
| `_expand` | — | **Tidak support** di json-server modern; akan di-handle via custom server |

## 3. Menu Navigation

### 3.1. Menu Karyawan

```
Dashboard           → /dashboard
Absensi             → /absensi
  ├─ Check-in/Out   → /absensi
  └─ Riwayat        → /absensi/riwayat
Pengajuan           → /pengajuan
  ├─ Daftar         → /pengajuan
  └─ Ajukan Baru    → /pengajuan/baru
Profil              → /profil
Logout              → trigger logout
```

### 3.2. Menu Admin / HRD

```
Dashboard HRD       → /hrd/dashboard
Karyawan            → (di dalam dashboard HRD)
  ├─ Daftar Karyawan  → /hrd/dashboard (tabel)
  └─ Detail Karyawan  → modal/drawer
Pengajuan           → /hrd/dashboard (section pending)
Profil              → /profil
Logout              → trigger logout
```

> Untuk Admin, pengelolaan pengajuan dan daftar karyawan cukup di satu halaman Dashboard HRD dengan beberapa tab/section.

## 4. Component Tree (per Halaman)

### Layouts

```
AuthLayout
├── Logo
└── Outlet (LoginPage / RegisterPage)

MainLayout
├── Sidebar / Navbar (menu tergantung role)
├── Breadcrumb
└── Outlet (halaman konten)
```

### Halaman Kunci

```
DashboardPage
├── StatsCard (kehadiran hari ini)
├── StatsCard (kehadiran minggu ini)
├── StatsCard (kehadiran bulan ini)
├── RecentActivityList
└── QuickActions (check-in button)

AbsensiPage
├── StatusCard (status hari ini)
├── CheckInButton (dengan face verification toggle)
├── CheckOutButton
└── WebcamCapture (modal face verification)

RiwayatPage
├── FilterBar (tanggal range, status dropdown)
├── SortSelector
└── AbsensiTable

PengajuanFormPage
├── FormJenis (radio: cuti/izin/sakit)
├── DateRangePicker
├── TextArea (alasan)
└── SubmitButton

HrdDashboardPage
├── StatsRow (total karyawan, hadir hari ini, pending izin, dll)
├── KehadiranChart (bar/line chart)
├── KaryawanTable (searchable, sortable)
├── PengajuanPendingList (dengan tombol approve/reject)
└── ModalDetailKaryawan
```
