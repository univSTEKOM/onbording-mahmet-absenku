# AbsenKu — Sistem Absensi Karyawan

AbsenKu adalah aplikasi manajemen kehadiran dan HRD berbasis web yang dirancang untuk memudahkan pencatatan absensi, pengajuan cuti/izin, serta monitoring kehadiran karyawan secara real-time.

## Struktur Proyek

```
on-boarding-trials/
├── frontend/          # Frontend lama (React + React Router)
├── frontend-v2/       # Frontend baru (better-t-stack + TanStack Router)
├── mock-api/          # API mock untuk development
└── docs/              # Dokumentasi proyek
```

## Tech Stack

### Frontend
| Komponen | Frontend (lama) | Frontend-v2 (baru) |
|---|---|---|---|
| Framework | React 19 + Vite 8 | React 19 + Vite 8 |
| Routing | React Router v7 | TanStack Router |
| Data Fetching | TanStack Query | TanStack Query |
| HTTP Client | Axios | Axios |
| Styling | Tailwind CSS v4 | Tailwind CSS v4 |
| UI Kit | shadcn/ui (base-ui) | shadcn/ui |
| Auth | better-auth | better-auth |
| Package Manager | npm | bun |
| Linter | oxlint | oxlint |

### Mock API
| Komponen | Detail |
|---|---|
| Server | json-server + Express |
| Auth | better-auth (SQLite) |
| Database | db.json (JSON file) |
| Port | 3001 |
| Package Manager | npm |
