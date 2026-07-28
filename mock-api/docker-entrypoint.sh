#!/bin/sh
set -e

echo "🌱 Seeding database..."
node seed.js

echo ""
echo "=========================================="
echo "  🚀 AbsenKu — Mock API"
echo "=========================================="
echo ""
echo "  URL    : http://0.0.0.0:${PORT:-3001}"
echo ""
echo "  📋 Akun Demo:"
echo "  ┌─────────────────────────────┬──────────┬──────────┐"
echo "  │ Email                       │ Password │ Role     │"
echo "  ├─────────────────────────────┼──────────┼──────────┤"
echo "  │ andika@stekom.ac.id         │ password │ admin    │"
echo "  │ rudi@stekom.ac.id           │ password │ karyawan │"
echo "  │ siti@stekom.ac.id           │ password │ karyawan │"
echo "  │ budi@stekom.ac.id           │ password │ karyawan │"
echo "  │ dewi@stekom.ac.id           │ password │ karyawan │"
echo "  │ ani@stekom.ac.id            │ password │ karyawan │"
echo "  │ tono@stekom.ac.id           │ password │ karyawan │"
echo "  │ ferry@stekom.ac.id          │ password │ karyawan │"
echo "  └─────────────────────────────┴──────────┴──────────┘"
echo ""
echo "  🔑 Demo password: ${DEMO_PASSWORD:-password}"
echo "=========================================="
echo ""

exec node server.js
