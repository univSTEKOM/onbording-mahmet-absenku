# Deploy ke Dokploy

## Prasyarat

- Server dengan Docker Engine & Dokploy terinstall
- Repository GitHub

## Environment Variables

Set via **Dokploy Dashboard → Project → Environment Variables**:

| Variable | Wajib | Default | Contoh |
|----------|-------|---------|--------|
| `VITE_API_URL` | ✅ | `http://localhost:3001` | `https://api.domain.com` |
| `BETTER_AUTH_SECRET` | ✅ | `change-this-in-production` | `random-string-min-32-characters` |
| `DEMO_PASSWORD` | — | `password` | `password` |
| `CORS_ORIGIN` | — | `http://localhost:5173` | `https://absenku.domain.com` |
| `MOCK_API_PORT` | — | `9876` | *(host port mock API)* |
| `MOCK_API_CONTAINER_PORT` | — | `9089` | *(internal container port mock API)* |
| `FRONTEND_PORT` | — | `5173` | *(kosongkan untuk Dokploy)* |

### Keterangan

- **`VITE_API_URL`** — URL backend. Di local: `http://localhost:3001`. Di production: domain backend (misal `https://api.domain.com`).
- **`BETTER_AUTH_SECRET`** — Secret key untuk session encryption. **Wajib diganti** untuk production, minimal 32 karakter.
- **`DEMO_PASSWORD`** — Password untuk semua akun demo. Default `password`.
- **`FRONTEND_PORT`** — Port host untuk frontend. **Kosongkan di Dokploy** (Dokploy route domain langsung ke container port 80).

## Langkah Deploy

1. Buka dashboard Dokploy → **Create Project**
2. Pilih **Docker Compose**
3. Hubungkan repository GitHub
4. Set environment variables dari tabel di atas
5. Deploy

## Akun Demo

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
  ├── mock-api (absenku-api)
  │   ├── Port: 3001
  │   ├── Env: BETTER_AUTH_SECRET, DEMO_PASSWORD
  │   ├── Volume: mock-api-data:/app/data
  │   └── Healthcheck: GET /api/me → 401
  │
  └── frontend (absenku-web)
      ├── Port: 80 (internal)
      ├── Build arg: VITE_API_URL
      └── Depends on: mock-api (healthy)
```

## Data Persistence

Database SQLite (`auth.db`) dan data JSON (`db.json`) disimpan di volume `mock-api-data`. Seed dijalankan setiap container start.

Reset data:
```bash
docker compose down -v
docker compose up -d
```
