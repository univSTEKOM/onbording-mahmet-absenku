# Frontend Trial Project

# Trial Onboarding — Frontend Client (Sistem Absensi Karyawan)

## Apa Ini

Tahap pertama project trial onboarding dev baru. Fokus tunggal: **membangun frontend client** untuk sistem absensi karyawan. Client bersifat agnostic — dev bebas memakai stack yang dikuasai.

Template internal (Nest + TanStack) **belum digunakan** di tahap ini. Itu dijelaskan setelah flow client selesai dan bisa didemonstrasikan utuh.

## Tujuan Tahap Ini

Dev menghasilkan frontend absensi yang berjalan penuh (semua alur inti berfungsi) menggunakan mock API lokal dan siap didemonstrasikan end-to-end.

## Tema

Sistem absensi karyawan : mencakup CRUD, relasi data, dua role (karyawan vs HRD), dan satu fitur face recognition.

## Aturan Main

* **Stack bebas** — pilih yang dikuasai. Yang dinilai: hasil & kualitas alur, bukan pilihan tools.
* **Mock API lokal** — pakai `json-server`. Data persist di `db.json`, jadi CRUD bisa dites beneran.
* **Rancang shape API sendiri** — struktur endpoint & data didesain dev.
* **Auth di-fake dulu** — login sungguhan menyusul di tahap template.

## Contoh Project Akhir

##### User Admin

https://api-onboarding.ocdev.web.id

email : [andika@stekom.ac.id](mailto:andika@stekom.ac.id)

password : password

##### User Karyawan

https://onboarding.ocdev.web.id

email : [andika@stekom.ac.id](mailto:andika@stekom.ac.id)

password: password

## Ruang Lingkup Fitur

| Fitur                          | Cakupan                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| Pendaftaran akun & manage info | Register, edit profil, kelola data akun                                 |
| Proses absensi                 | Check-in / check-out                                                    |
| History kehadiran              | Riwayat per karyawan, filter & sort                                     |
| Pengajuan izin / cuti          | Ajukan, status pending/approved/rejected                                |
| Dashboard personal             | Ringkasan kehadiran diri sendiri                                        |
| Dashboard HRD                  | Overview seluruh karyawan                                               |
| Face Recognition               | Verifikasi wajah saat absen — **bonus/extend**, jangan blokir alur inti |

Boleh di-extend selama koheren dengan tema.

## Definisi Selesai

Tahap client dianggap selesai bila:

* Semua fitur inti (akun, absensi, history, izin/cuti, dua dashboard) berjalan lawan mock.
* CRUD terbukti persist (create lalu tampil di list/history).
* Alur bisa didemonstrasikan utuh dari sudut pandang karyawan dan HRD.

Setelah titik ini terpenuhi → lanjut ke penjelasan template Nest + TanStack.

## Catatan Teknis

* Base URL API ditaruh di satu tempat (mis. env) agar tahap integrasi nanti minim rework.
* Jaga konsistensi shape data sejak awal — ini yang menentukan mulusnya integrasi ke API asli.
* Face Recognition disarankan berbasis browser (mis. face-api.js) agar tetap gratis dan tidak memblokir.

