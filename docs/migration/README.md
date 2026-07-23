# Migrasi Frontend

Panduan migrasi dari `frontend/` (lama) ke `frontend-v2/` (baru).

## Tujuan

- Kode lebih bersih, rapi, reusable
- Performa lebih cepat dan ringan
- Type-safe routing dengan TanStack Router
- Struktur komponen yang terorganisir
- Menghilangkan code debt dari frontend lama

## Pendekatan

Frontend lama (`frontend/`) **tidak dihapus**. Frontend baru (`frontend-v2/`) dibuat dari awal dengan better-t-stack.

```
frontend/          → Dipertahankan sebagai referensi
frontend-v2/       → Pengembangan baru, migrasi bertahap
```

## Tahapan Migrasi

| # | Tahap | Detail |
|---|---|---|
| 1 | Setup | Init better-t-stack project |
| 2 | API Layer | Setup Axios instance + TanStack Query hooks |
| 3 | Auth | Integrasi better-auth (sama seperti frontend lama) |
| 4 | Routes | Setup TanStack Router dengan file-based routing |
| 5 | Layout | Root layout, sidebar, header, guards |
| 6 | Pages | Migrasi halaman satu per satu |
| 7 | Components | Extract reusable components |
| 8 | Polish | Testing, lint, performance check |

## Perbedaan Arsitektur

| Aspek | Frontend (lama) | Frontend-v2 (baru) |
|---|---|---|
| Routing | createBrowserRouter (library mode) | TanStack Router (file-based) |
| Code splitting | Manual `lazy()` | Auto code-split |
| Type safety | Manual | Full inferred (params, search, state) |
| Route guards | JSX component (Outlet) | beforeLoad + component guard |
| Search params | useSearchParams (string) | useSearch (JSON + Zod) |
| API layer | axios instance | axios + TanStack Query hooks |
| Auth | useAuth hook + context | useAuth hook + router context |
| Components | Campuran UI/page | Clean separation |

## Command Install Frontend-v2

```bash
cd on-boarding-trials
bun create better-t-stack@latest frontend-v2 \
  --frontend tanstack-router \
  --backend none \
  --runtime none \
  --api none \
  --auth none \
  --payments none \
  --database none \
  --orm none \
  --db-setup none \
  --package-manager bun \
  --git \
  --web-deploy none \
  --server-deploy none \
  --install \
  --addons lefthook mcp oxlint skills \
  --examples none
```
