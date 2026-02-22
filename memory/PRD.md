# Jam Sholat Digital KHGT Muhammadiyah - PRD

## Original Problem Statement
Bangun sebuah Web App Jam Sholat Digital berbasis KHGT Muhammadiyah, siap di-deploy di VPS/self-hosted, dengan panel dashboard untuk konfigurasi dan manajemen konten. Web App ini akan ditampilkan di TV masjid melalui STB Android TV Box dalam mode fullscreen.

**Extended Scope:** Proyek berkembang menjadi ekosistem website masjid lengkap dengan:
- TV Display (jamsholat.masjidmuktamirin.web.id)
- Website Publik (masjidmuktamirin.web.id)
- Channel Ramadan (ramadhan.masjidmuktamirin.web.id)
- Dashboard Admin (admin.masjidmuktamirin.web.id)

## User Personas
1. **Takmir/Pengurus Masjid** - Admin yang mengelola konten, jadwal, dan pengaturan via dashboard
2. **Jamaah Masjid** - Pengguna yang melihat display TV di masjid atau website
3. **Muadzin** - Menggunakan countdown iqomah setelah adzan
4. **Pengunjung Website** - Melihat jadwal sholat, agenda, dan info masjid online

## Tech Stack
- Backend: FastAPI, MongoDB, Motor (async)
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI, Recharts
- Auth: JWT (PyJWT, bcrypt), Role-based (admin/editor)
- Deployment: Docker, Docker Compose, Nginx

---

## What's Been Implemented ✅

### Update: 22 Desember 2025 - Fitur Lengkap Website & Dashboard

#### 1. Backend API (Semua CRUD + Auth)
- **ZIS (Zakat, Infaq, Shodaqoh)**
  - `GET, POST, PUT, DELETE /api/zis`
  - `GET /api/zis/summary` - Ringkasan bulanan
  - `GET /api/zis/monthly-chart` - Data grafik tahunan
- **Announcements/Pengumuman**
  - `GET, POST, PUT, DELETE /api/announcements`
- **Pengurus (Struktur Takmir)**
  - `GET, POST, PUT, DELETE /api/pengurus`
  - Role-based: hanya admin yang bisa edit
- **Special Events (Event Khusus)**
  - `GET, POST, PUT, DELETE /api/special-events`
- **Gallery**
  - `GET, POST, PUT, DELETE /api/gallery`
- **Islamic Quotes**
  - `GET, POST, PUT, DELETE /api/quotes`
  - `GET /api/quotes/random` - Random quote untuk homepage

#### 2. Dashboard Admin (Semua Menu Baru)
- **Laporan ZIS** - Tabel + Grafik Recharts, Filter bulan/tahun
- **Pengumuman** - CRUD dengan kategori dan prioritas
- **Struktur Pengurus** - CRUD dengan foto, jabatan, periode
- **Event Khusus** - CRUD untuk Nuzulul Quran, Syawalan, dll
- **Galeri Foto** - CRUD dengan upload gambar
- **Quote Islami** - CRUD dengan teks Arab dan terjemahan
- **Role-based Access** - Admin: full access, Editor: konten saja

#### 3. Website Publik
- **Homepage**
  - Card ringkasan ZIS bulan ini
  - Quote Islami random
  - Widget Donasi Cepat dengan QRIS
  - Countdown sholat berikutnya
- **AboutPage (Tentang Kami)**
  - QRIS real (gambar dari user)
  - Form kontak → **WhatsApp redirect** (628121554551)
  - Daftar pengumuman dari API
  - Struktur pengurus dari API
  - Info rekening BSI

#### 4. Docker Deployment
- `backend/Dockerfile` - Python 3.11 + FastAPI
- `frontend/Dockerfile` - Multi-stage (Node → Nginx)
- `frontend/nginx.conf` - React SPA config
- `docker-compose.yml` - MongoDB + Backend + Frontend
- `.env.example` files untuk semua services
- `DEPLOYMENT.md` - Dokumentasi lengkap
- `GET /api/health` - Health check endpoint

---

## Database Models

```
users: {username, password_hash, name, role}
zis_reports: {type, amount, date, month, year, donor_name, description}
announcements: {title, content, category, is_active, priority}
pengurus: {name, position, period, photo_url, phone, order}
special_events: {title, event_date, event_time, location, category, imam, speaker}
gallery: {title, image_url, description, event_date, order}
quotes: {arabic_text, translation, source, order}
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` (with role)
- `POST /api/auth/login`
- `GET /api/auth/me`

### Mosque
- `GET, PUT /api/mosque/identity`
- `GET, PUT /api/settings/*`

### Content
- `GET, POST, PUT, DELETE /api/zis`
- `GET /api/zis/summary`, `/api/zis/monthly-chart`
- `GET, POST, PUT, DELETE /api/announcements`
- `GET, POST, PUT, DELETE /api/pengurus`
- `GET, POST, PUT, DELETE /api/special-events`
- `GET, POST, PUT, DELETE /api/gallery`
- `GET, POST, PUT, DELETE /api/quotes`
- `GET /api/quotes/random`
- `GET, POST, PUT, DELETE /api/ramadan-schedule`

---

## Prioritized Backlog

### P0 - Critical ✅ COMPLETED
- [x] ZIS Report Channel dengan grafik
- [x] Dashboard admin untuk semua fitur
- [x] Homepage dengan ZIS card dan QRIS
- [x] AboutPage dengan WhatsApp redirect
- [x] Docker deployment files
- [x] Role-based access control

### P1 - High Priority (Next)
- [ ] Import data Ramadan dari PDF (30 hari jadwal)
- [ ] FullCalendar di AgendaPage
- [ ] Tab Informasi/Laporan ZIS di halaman khusus
- [ ] Upload QRIS dari dashboard admin

### P2 - Medium Priority
- [ ] Artikel kegiatan masjid
- [ ] Subdomain routing untuk production
- [ ] Gallery slider di homepage

### P3 - Future
- [ ] Live KHGT API integration
- [ ] Google Calendar sync
- [ ] Backup otomatis

---

## Test Credentials
- **Admin:** username=`admin`, password=`admin123` (role: admin)
- **Editor:** Can be created via register (role: editor)

## QRIS Info
- Image URL: `https://customer-assets.emergentagent.com/.../QRIS%20Modif%4010x-100%20Large.jpeg`
- Bank: BSI (Bank Syariah Indonesia)
- Rekening: 7148254552
- a.n. Masjid Muktamirin

## WhatsApp Contact
- Number: 628121554551
- Format: `https://api.whatsapp.com/send?phone=628121554551&text=...`
