# Deploy ke Dokploy

## Prasyarat

- Server dengan Docker Engine & Dokploy terinstall
- PostgreSQL eksternal (bisa via Dokploy atau penyedia lain)
- Repository GitHub

## Environment Variables

Set via **Dokploy Dashboard → Project → Environment Variables**:

| Variable | Wajib | Default | Contoh |
|----------|-------|---------|--------|
| `DATABASE_URL` | ✅ | — | `postgresql://user:pass@host:5432/absenku` |
| `BETTER_AUTH_SECRET` | ✅ | — | `random-string-min-32-characters` |
| `VITE_API_URL` | ✅ | `http://localhost:9090` | `https://api.domain.com` |
| `CORS_ORIGIN` | — | `http://localhost:5173` | `https://app.domain.com` |
| `DEMO_PASSWORD` | — | `password` | `password` |
| `APP_RELEASE_DATE` | — | `2026-07-13` | `2026-07-13` |
| `MINIO_ROOT_USER` | — | `minioadmin` | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | — | `minioadmin` | `strong-password` |
| `MINIO_PUBLIC_URL` | — | `http://localhost:9000` | `https://files.domain.com` |
| `MINIO_ACCESS_KEY` | — | `minioadmin` | `minioadmin` |
| `MINIO_SECRET_KEY` | — | `minioadmin` | `strong-password` |
| `FRONTEND_PORT` | — | `5173` | *(kosongkan untuk Dokploy)* |

### Keterangan

- **`DATABASE_URL`** — PostgreSQL eksternal. Wajib bisa diakses dari container.
- **`BETTER_AUTH_SECRET`** — Secret key untuk session encryption. **Wajib diganti**, minimal 32 karakter.
- **`MINIO_PUBLIC_URL`** — URL yang bisa diakses browser untuk foto (bukan hostname docker internal).
- **`MINIO_ENDPOINT`** — otomatis `http://minio:9000` di dalam compose (tidak perlu di-set).

## Langkah Deploy

1. Buka dashboard Dokploy → **Create Project**
2. Pilih **Docker Compose**
3. Hubungkan repository GitHub
4. Set environment variables dari tabel di atas
5. Deploy

## Akun Demo (Seed Otomatis)

Backend otomatis migrate + seed saat start. Data yang sudah ada di-skip/di-repair (tidak duplikat).

| Email | Password | Role |
|-------|----------|------|
| andika@stekom.ac.id | `DEMO_PASSWORD` | admin |
| rudi@stekom.ac.id | `DEMO_PASSWORD` | karyawan |
| siti@stekom.ac.id | `DEMO_PASSWORD` | karyawan |
| budi@stekom.ac.id | `DEMO_PASSWORD` | karyawan (pending) |
| dewi@stekom.ac.id | `DEMO_PASSWORD` | karyawan |
| ani@stekom.ac.id | `DEMO_PASSWORD` | karyawan |
| tono@stekom.ac.id | `DEMO_PASSWORD` | karyawan |
| ferry@stekom.ac.id | `DEMO_PASSWORD` | karyawan (pending) |

## Struktur Service

```
Dokploy
  │
  ├── backend (absenku-backend)
  │   ├── Port: 9090
  │   ├── Env: DATABASE_URL, BETTER_AUTH_SECRET, MINIO_*
  │   ├── Startup: migrate → seed → start
  │   └── Depends on: minio (healthy)
  │
  ├── minio (absenku-minio)
  │   ├── Ports: 9000 (API), 9001 (Console)
  │   └── Volume: minio-data
  │
  └── frontend (absenku-web)
      ├── Port: 80 (internal)
      ├── Build arg: VITE_API_URL
      └── Depends on: backend
```

> PostgreSQL tidak disertakan — gunakan database eksternal (Dokploy PostgreSQL, Supabase, dll).

## Data Persistence

- **MinIO**: volume `minio-data` — foto profil + foto absensi
- **PostgreSQL**: database eksternal Anda — migrate otomatis saat start
