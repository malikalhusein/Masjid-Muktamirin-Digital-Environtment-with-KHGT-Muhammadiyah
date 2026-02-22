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

## Core Requirements (Static)
- Display jadwal sholat 5 waktu dari KHGT Muhammadiyah
- Countdown waktu adzan dan iqamah
- Identitas masjid (nama, logo, alamat)
- Kalender Hijriyah dan Masehi
- Konten slideshow (poster, pengumuman)
- Agenda masjid
- Running text
- Panel dashboard admin dengan JWT auth
- Kalibrasi manual untuk waktu sholat
- Notifikasi suara/dering
- Website publik dengan halaman Home, Agenda, About
- Channel Ramadan dengan jadwal imam dan penceramah
- **Docker deployment files untuk self-hosted**

## Tech Stack
- Backend: FastAPI, MongoDB, Motor (async)
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI
- Auth: JWT (PyJWT, bcrypt)
- Data KHGT: Hardcoded dari hisabmu.com
- Deployment: Docker, Docker Compose, Nginx

## Default Location
Kecamatan Galur, Kulon Progo, Yogyakarta
- Latitude: -7.9404
- Longitude: 110.2357
- Timezone: UTC+7 (WIB)

## URLs (Development)
- TV Display: /
- Homepage: /homepage
- Agenda: /homepage/agenda
- About Us: /homepage/about
- Ramadan Channel: /ramadan
- Admin Login: /connect
- Dashboard: /connect/dashboard

---

## What's Been Implemented ✅

### Update: 22 Desember 2025 - Docker Deployment & Website AboutPage

#### New Features
1. **Docker Deployment Files:**
   - `/app/backend/Dockerfile` - Python FastAPI container
   - `/app/frontend/Dockerfile` - Multi-stage build (Node -> Nginx)
   - `/app/frontend/nginx.conf` - Nginx config untuk React SPA
   - `/app/docker-compose.yml` - Orchestration (MongoDB, Backend, Frontend)
   - `/app/.env.example`, `/app/backend/.env.example`, `/app/frontend/.env.example` - Environment templates
   - `/app/DEPLOYMENT.md` - Dokumentasi deployment lengkap

2. **Health Check Endpoint:**
   - `GET /api/health` - Returns database connection status
   - Digunakan oleh Docker healthcheck

3. **AboutPage Complete (Tentang Kami):**
   - Profil Masjid dengan statistik
   - Daftar Pengumuman (mock data, siap API)
   - Form Kontak (nama, email, HP, pesan)
   - Info Kontak (telepon, email, alamat)
   - Modul Donasi QRIS (placeholder + rekening bank)
   - Struktur Pengurus Takmir
   - Navigation & Footer konsisten dengan halaman lain

4. **Website Pages Complete:**
   - HomePage: Hero, jadwal sholat bar, agenda terdekat
   - AgendaPage: Kalender interaktif, jadwal sholat lengkap
   - RamadanPage: Program Ramadan dengan jadwal imam
   - AboutPage: Info masjid, donasi, kontak

#### Files Created/Modified
- `/app/backend/Dockerfile` - NEW
- `/app/backend/server.py` - Added health endpoint
- `/app/frontend/Dockerfile` - NEW
- `/app/frontend/nginx.conf` - NEW
- `/app/docker-compose.yml` - NEW
- `/app/.env.example` - NEW
- `/app/backend/.env.example` - NEW
- `/app/frontend/.env.example` - NEW
- `/app/DEPLOYMENT.md` - NEW
- `/app/frontend/src/pages/website/AboutPage.jsx` - Redesigned

### Previous Updates
- Dashboard refactor: Merged menus for clarity
- TV Display: Cleanup, removed settings icon
- Countdown system with adzan/iqomah modes
- Sound notifications with Web Audio API
- Background image management
- Ramadan module with backend API

---

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Implementasi countdown waktu adzan/iqomah
- [x] Kalibrasi manual per waktu sholat
- [x] Notifikasi suara untuk countdown
- [x] Dashboard refactor
- [x] Docker deployment files
- [x] Website HomePage, AgendaPage, AboutPage

### P1 - High Priority
- [ ] Implement backend API for announcements/pengumuman
- [ ] Implement backend API for contact form submissions
- [ ] FullCalendar integration di AgendaPage
- [ ] Upload QRIS image di dashboard
- [ ] Expand KHGT data untuk bulan lain

### P2 - Medium Priority
- [ ] Backend untuk articles/artikel kegiatan
- [ ] Role-based access control (admin/editor)
- [ ] Google Calendar sync
- [ ] Subdomain routing configuration

### P3 - Low Priority
- [ ] Live KHGT API integration
- [ ] Video content support
- [ ] Multi-language support
- [ ] Offline mode/PWA

---

## Test Credentials
- Username: `admin`
- Password: `admin123`

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register, login`
- `GET /api/auth/me`
- `GET, PUT /api/mosque/identity`
- `GET, PUT /api/settings/prayer`
- `GET, PUT /api/settings/layout`
- `GET /api/prayer-times`
- `GET /api/prayer-times/monthly`
- `GET, POST, PUT, DELETE /api/content`
- `GET, POST, PUT, DELETE /api/agenda`
- `GET, POST, PUT, DELETE /api/running-text`
- `GET, POST, DELETE /api/ramadan-schedule/{date}`
- `GET /api/stats`

## Mocked Features
- **Pengumuman**: Mock data di AboutPage.jsx (backend API belum ada)
- **Contact Form**: Simulated submission (backend API belum ada)
