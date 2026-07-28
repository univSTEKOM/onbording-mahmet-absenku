# Deploy ke Dokploy

Dokploy adalah platform self-hosted PaaS yang mendukung Docker Compose secara native.

## Prasyarat

- Server dengan Docker Engine & Dokploy terinstall
- Repository GitHub

## Langkah Deploy

### 1. Set Environment Variables

Salin `.env` yang sudah di-commit, atau set via dashboard Dokploy:

| Variable | Contoh | Keterangan |
|----------|--------|------------|
| `VITE_API_URL` | `https://api.domain.com` | URL backend (ubah sesuai domain) |
| `BETTER_AUTH_SECRET` | `random-32-chars-min` | Wajib diganti untuk production |
| `DEMO_PASSWORD` | `password` | Password akun demo |

### 2. Buat Project di Dokploy

1. Buka dashboard Dokploy
2. Klik **Create Project**
3. Pilih **Docker Compose**
4. Hubungkan repository GitHub
5. Set environment variables (opsional — bisa juga lewat `.env`)
6. Deploy

### 3. Verifikasi

```
http://domain.com  → Frontend (nginx, port 80)
http://domain.com:3001 → Mock API (port 3001)
```

## Struktur Service

```
Dokploy
  │
  ├── mock-api (absenku-api)
  │   ├── Port: 3001
  │   ├── Env: .env → BETTER_AUTH_SECRET, DEMO_PASSWORD
  │   ├── Volume: mock-api-data:/app/data (persist db)
  │   └── Healthcheck: GET /api/me → 401
  │
  └── frontend (absenku-web)
      ├── Port: 80 (internal) → domain
      ├── Build arg: VITE_API_URL
      └── Depends on: mock-api (healthy)
```

## Data Persistence

Database SQLite (`auth.db`) dan data JSON (`db.json`) disimpan di volume `mock-api-data`. Data akan persist selama volume tidak dihapus.

Seed dijalankan setiap container start. Jika ingin reset data:

```bash
# Akses server, hapus volume
docker compose down -v
docker compose up -d
```

## Catatan

- **Root `.env`** adalah single source of truth — semua env var dibaca dari sini saat `docker compose up`
- **`frontend/.env`** dan **`mock-api/.env`** tidak di-commit — hanya untuk development manual tanpa Docker
- Pastikan `BETTER_AUTH_SECRET` diubah untuk production (min 32 karakter)
