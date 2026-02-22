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
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI, Recharts, FullCalendar
- Auth: JWT (PyJWT, bcrypt), Role-based (admin/editor)
- Deployment: Docker, Docker Compose, Nginx

---

## What's Been Implemented

### Update: 22 Februari 2026 - P0 Features Complete

#### 1. Responsive Navigation & Mobile Menu
- **Burger menu** untuk tampilan mobile/tablet (viewport < 768px)
- **Sheet sidebar** dari Shadcn/UI untuk navigasi mobile
- **WebsiteNavigation component** yang reusable untuk semua halaman
- **WebsiteFooter component** yang reusable
- Logo masjid sekarang menggunakan `mosqueIdentity.logo_url` dari API

#### 2. Homepage Gallery Slider
- **Carousel component** untuk galeri foto kegiatan
- Conditional rendering - hanya tampil jika ada data galeri
- Hover effect dengan overlay dan caption

#### 3. Weekly Agenda Compact
- Section ringkas agenda 7 hari ke depan
- Conditional rendering - hanya tampil jika ada agenda
- Tampilan kompak dengan tanggal dan judul

#### 4. Footer Updates
- Nomor rekening BSI yang benar: 7148254552
- Link navigasi lengkap termasuk Informasi ZIS

---

### Previous Implementation (22 Desember 2025)

#### Backend API (Semua CRUD + Auth)
- **ZIS (Zakat, Infaq, Shodaqoh)**: `GET, POST, PUT, DELETE /api/zis`, `/api/zis/summary`, `/api/zis/monthly-chart`
- **Announcements/Pengumuman**: `GET, POST, PUT, DELETE /api/announcements`
- **Pengurus (Struktur Takmir)**: `GET, POST, PUT, DELETE /api/pengurus`
- **Special Events (Event Khusus)**: `GET, POST, PUT, DELETE /api/special-events`
- **Gallery**: `GET, POST, PUT, DELETE /api/gallery`
- **Islamic Quotes**: `GET, POST, PUT, DELETE /api/quotes`, `/api/quotes/random`
- **QRIS Settings**: `GET, PUT /api/qris-settings`
- **Ramadan Schedule**: `GET, POST, DELETE /api/ramadan/schedule`

#### Dashboard Admin
- Semua menu untuk modul baru
- Role-based access (admin/editor)

#### Website Publik
- Homepage dengan ZIS card, Quote Islami, QRIS
- About Page dengan WhatsApp redirect
- Informasi Page dengan grafik ZIS (Recharts)
- Agenda Page dengan FullCalendar

#### Docker Deployment
- Dockerfile untuk backend dan frontend
- docker-compose.yml untuk orchestration
- DEPLOYMENT.md dokumentasi

---

## Database Models

```
users: {username, password_hash, name, role}
identity: {name, address, logo_url, latitude, longitude, elevation, timezone_offset}
settings: {layout, iqomah_duration, ...}
zis_reports: {type, amount, date, month, year, donor_name, description}
announcements: {title, content, category, is_active, priority}
pengurus: {name, position, period, photo_url, phone, order}
special_events: {title, event_date, event_time, location, category, imam, speaker}
gallery: {title, image_url, description, event_date, order, is_active}
quotes: {arabic_text, translation, source, order, is_active}
agenda: {title, event_date, event_time, description, is_active}
ramadan_schedules: {date, imam_subuh, ...}
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

### Content Management
- `GET, POST, PUT, DELETE /api/zis`
- `GET /api/zis/summary`, `/api/zis/monthly-chart`
- `GET, POST, PUT, DELETE /api/announcements`
- `GET, POST, PUT, DELETE /api/pengurus`
- `GET, POST, PUT, DELETE /api/special-events`
- `GET, POST, PUT, DELETE /api/gallery`
- `GET, POST, PUT, DELETE /api/quotes`
- `GET /api/quotes/random`
- `GET, POST, PUT, DELETE /api/agenda`
- `GET, POST, DELETE /api/ramadan/schedule`

---

## Prioritized Backlog

### P0 - Critical (COMPLETED)
- [x] ZIS Report Channel dengan grafik
- [x] Dashboard admin untuk semua fitur
- [x] Homepage dengan ZIS card dan QRIS
- [x] AboutPage dengan WhatsApp redirect
- [x] Docker deployment files
- [x] Role-based access control (model level)
- [x] Responsive Navigation dengan burger menu
- [x] Logo masjid dari API
- [x] Gallery slider (conditional)
- [x] Weekly agenda compact (conditional)

### P1 - High Priority (Next)
- [ ] Role-Based Access Control (RBAC) - protect API endpoints
- [ ] RBAC - conditional UI rendering based on user role
- [ ] Upload logo via dashboard and display on all pages
- [ ] Add sample data for Gallery and Agenda via admin

### P2 - Medium Priority
- [ ] Subdomain routing untuk production
- [ ] Backup otomatis database
- [ ] Monitoring via 1Panel

### P3 - Future
- [ ] Live KHGT API integration
- [ ] Google Calendar sync
- [ ] HTTPS via Cloudflare

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

---

## File Architecture

```
/app/
├── backend/
│   ├── .env                # DB_NAME=masjid_db
│   ├── requirements.txt
│   ├── server.py           # All models and routes
│   └── seed_ramadan.py     # Ramadan data seeder
├── frontend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── WebsiteNavigation.jsx  # NEW: Shared Nav & Footer
│       │   └── ui/                     # Shadcn components
│       ├── lib/
│       │   └── api.js
│       └── pages/
│           ├── website/
│           │   ├── HomePage.jsx      # UPDATED: Gallery, Weekly Agenda
│           │   ├── AboutPage.jsx     # UPDATED: WebsiteNavigation
│           │   ├── AgendaPage.jsx    # UPDATED: WebsiteNavigation
│           │   └── InformasiPage.jsx # UPDATED: WebsiteNavigation
│           └── Dashboard/
├── memory/
│   └── PRD.md
├── test_reports/
├── DEPLOYMENT.md
├── docker-compose.yml
└── Dockerfile
```
