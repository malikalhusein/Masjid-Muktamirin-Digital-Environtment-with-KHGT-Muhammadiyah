# Jam Sholat Digital KHGT Muhammadiyah - PRD

## Original Problem Statement
Bangun sebuah Web App Jam Sholat Digital berbasis KHGT Muhammadiyah, siap di-deploy di VPS/self-hosted, dengan panel dashboard untuk konfigurasi dan manajemen konten. Web App ini akan ditampilkan di TV masjid melalui STB Android TV Box dalam mode fullscreen.

## User Personas
1. **Takmir/Pengurus Masjid** - Admin yang mengelola konten, jadwal, dan pengaturan via dashboard
2. **Jamaah Masjid** - Pengguna yang melihat display TV di masjid
3. **Muadzin** - Menggunakan countdown iqomah setelah adzan

## Core Requirements (Static)
- Display jadwal sholat 5 waktu dari API KHGT Muhammadiyah
- Countdown waktu adzan dan iqomah
- Identitas masjid (nama, logo, alamat)
- Kalender Hijriyah dan Masehi
- Konten slideshow (poster, pengumuman)
- Agenda masjid
- Running text
- Panel dashboard admin dengan JWT auth

## What's Been Implemented ✅
**Date: 19 Februari 2026**

### Backend (FastAPI + MongoDB)
- JWT authentication (register/login)
- Mosque identity CRUD
- Prayer times API (KHGT integration via hisabmu.com)
- Prayer settings (iqomah duration, bell)
- Layout settings (theme, colors)
- Content management (poster, announcement, video)
- Agenda CRUD
- Running text CRUD
- File upload with base64

### Frontend (React)
- TV Display page (/) - fullscreen for TV
  - Live clock with seconds
  - 5 prayer times with Arabic names
  - Countdown to next prayer
  - Iqomah countdown mode
  - Content slideshow
  - Running text marquee
  - Hijri + Gregorian calendar
  - Bell notification indicator
- Admin Dashboard (/connect/*)
  - Login/Register
  - Dashboard overview with stats
  - Identity management
  - Content management
  - Agenda management
  - Running text management
  - Layout/theme settings
  - Iqomah & bell settings

### Design System
- Modern minimalist dark theme
- Emerald (#064E3B) + Gold (#D97706) palette
- Barlow Condensed (headings) + Outfit (body) + Amiri (Arabic)
- Glass-morphism cards
- Responsive for TV + desktop/mobile

## Prioritized Backlog

### P0 - Critical (Next)
- [ ] Integration dengan GPS dari STB Android TV Box
- [ ] Docker Compose deployment configuration
- [ ] Nginx reverse proxy setup

### P1 - High Priority
- [ ] Audio notification/bell sound (Web Audio API ready)
- [ ] Accurate Hijri calendar from KHGT API
- [ ] Multiple layout templates (classic, ramadhan)

### P2 - Medium Priority
- [ ] Homepage masjid subdomain (profil, berita)
- [ ] Kanal Ramadhan subdomain (imsakiyah, agenda tarawih)
- [ ] Admin unified dashboard for all subdomains

### P3 - Low Priority
- [ ] Video content support
- [ ] Multi-language support
- [ ] Offline mode/PWA

## Tech Stack
- Backend: FastAPI, MongoDB, Motor (async)
- Frontend: React 19, Tailwind CSS, Framer Motion
- Auth: JWT (PyJWT, bcrypt)
- API: KHGT via hisabmu.com

## Default Location
Kecamatan Galur, Kulon Progo, Yogyakarta
- Latitude: -7.9404
- Longitude: 110.2357
- Timezone: UTC+7 (WIB)

## URLs
- TV Display: /
- Admin Login: /connect
- Dashboard: /connect/dashboard
- Settings: /connect/settings

---

## Update: 19 Februari 2026 - Layout Options & Hijri Calendar Fix

### New Features
1. **3 Layout Options untuk TV Display:**
   - **Modern** (`/`) - Dark theme minimalis
   - **Classic** (`/classic`) - Background foto masjid seperti referensi
   - **Layout2** (`/layout2`) - Sidebar dengan quote dan countdown

2. **Kalender Hijriyah KHGT Akurat:**
   - Menggunakan tabel konversi KHGT 1447 H resmi
   - Menampilkan tanggal Ramadan dengan benar (bukan Sya'ban)
   - 18 Feb 2026 = 1 Ramadan 1447 H

3. **Fitur Ramadan:**
   - Waktu Imsak otomatis muncul saat Ramadan
   - Badge "Ramadan Mubarak!"
   - Countdown ke hari besar Islam (Nuzulul Quran, Idul Fitri)

### Files Added
- `/app/frontend/src/lib/khgtCalendar.js` - Tabel konversi KHGT 1447 H
- `/app/frontend/src/pages/TVDisplayClassic.jsx` - Layout klasik
- `/app/frontend/src/pages/TVDisplayLayout2.jsx` - Layout sidebar

### Routes
- `/` - Modern dark layout
- `/classic` - Classic dengan foto masjid
- `/layout2` - Sidebar layout
- `/connect` - Dashboard admin

---

## Update: 20 Februari 2026 - Perbaikan Kalender & Layout Switching

### Issues Fixed
1. **Kalender Hijriyah** - Sekarang benar menampilkan **3 Ramadan 1447 H** (bukan 2 Ramadan)
   - Menggunakan timezone WIB (UTC+7) untuk Indonesia
   - Mengacu pada tabel KHGT resmi dari hisabmu.com

2. **Layout Switching** - Layout sekarang berubah otomatis berdasarkan setting di dashboard
   - Setting theme disimpan di database
   - TVDisplay membaca setting dan render layout yang sesuai

3. **Background Image** - Bisa diganti dari halaman Tampilan di dashboard
   - Ada 3 preset background masjid
   - Bisa input URL custom

### Layouts Available
1. **Modern** - Dark theme minimalis dengan glass effect
2. **Classic** - Background foto masjid fullscreen (mirip referensi user)
3. **Al-Iftitar** - Sidebar layout dengan quote dan konten besar

### Ramadan Features
- Imsak time otomatis muncul di semua layout
- Badge "Ramadan Mubarak!" di layout Modern
- Countdown hari besar Islam (Nuzulul Quran, dll)
