# Jam Sholat Digital KHGT Muhammadiyah - PRD

## Original Problem Statement
Bangun sebuah Web App Jam Sholat Digital berbasis KHGT Muhammadiyah, siap di-deploy di VPS/self-hosted, dengan panel dashboard untuk konfigurasi dan manajemen konten. Web App ini akan ditampilkan di TV masjid melalui STB Android TV Box dalam mode fullscreen.

## User Personas
1. **Takmir/Pengurus Masjid** - Admin yang mengelola konten, jadwal, dan pengaturan via dashboard
2. **Jamaah Masjid** - Pengguna yang melihat display TV di masjid
3. **Muadzin** - Menggunakan countdown iqomah setelah adzan

## Core Requirements (Static)
- Display jadwal sholat 5 waktu dari KHGT Muhammadiyah
- Countdown waktu adzan dan iqomah
- Identitas masjid (nama, logo, alamat)
- Kalender Hijriyah dan Masehi
- Konten slideshow (poster, pengumuman)
- Agenda masjid
- Running text
- Panel dashboard admin dengan JWT auth
- Kalibrasi manual untuk waktu sholat
- Notifikasi suara/dering

## Tech Stack
- Backend: FastAPI, MongoDB, Motor (async)
- Frontend: React 19, Tailwind CSS, Framer Motion
- Auth: JWT (PyJWT, bcrypt)
- Data KHGT: Hardcoded dari hisabmu.com

## Default Location
Kecamatan Galur, Kulon Progo, Yogyakarta
- Latitude: -7.9404
- Longitude: 110.2357
- Timezone: UTC+7 (WIB)

## URLs
- TV Display: /
- Admin Login: /connect
- Dashboard: /connect/dashboard
- Kalibrasi: /connect/calibration
- Settings: /connect/settings

---

## What's Been Implemented ✅

### Update: 19 Februari 2026 - Kalibrasi & Notifikasi Suara

#### New Features
1. **Menu Kalibrasi di Dashboard:**
   - Route `/connect/calibration` dengan 2 tab
   - Tab "Kalibrasi per Waktu": Pengaturan per waktu sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya)
   - Setiap waktu memiliki 4 field: pre_adzan, jeda_adzan, pre_iqamah, jeda_sholat
   - Tab "Bunyi Notifikasi": 4 toggle untuk kontrol suara

2. **Sistem Notifikasi Suara:**
   - `SOUND_TYPES`: PRE_ADZAN, ADZAN, PRE_IQAMAH, IQAMAH
   - Setiap tipe memiliki karakteristik audio berbeda (frekuensi, durasi, pattern)
   - Menggunakan Web Audio API
   - Tombol test sound di halaman kalibrasi

3. **Countdown System dengan Mode:**
   - Mode `adzan`: Menuju waktu adzan
   - Mode `jeda_adzan`: Adzan berkumandang
   - Mode `iqomah`: Countdown menuju iqamah
   - Label dinamis dengan emoji indikator

4. **Bug Fix - Floating Bar Sidebar:**
   - Mengubah struktur sidebar dari `position: absolute` ke `flex`
   - User info di bagian bawah tidak lagi overlap dengan menu
   - Navigation area sekarang scrollable

5. **Bug Fix - Infinite Loop useEffect:**
   - Ditemukan oleh testing agent
   - Penyebab: `soundsPlayed` di dependency array sambil dimodifikasi dalam effect
   - Solusi: Menggunakan callback pattern untuk state updates

#### Files Modified
- `/app/frontend/src/pages/TVDisplay.jsx` - Countdown & notifikasi
- `/app/frontend/src/pages/dashboard/DashboardLayout.jsx` - Fix sidebar
- `/app/frontend/src/pages/dashboard/CalibrationPage.jsx` - UI kalibrasi
- `/app/frontend/src/lib/utils.js` - Sound system baru
- `/app/frontend/src/App.js` - Route kalibrasi

#### Backend (Already Complete)
- JWT authentication
- Mosque identity CRUD
- Prayer times (KHGT data Feb-Mar 2026)
- Prayer settings with calibration
- Layout settings
- Content, Agenda, Running text CRUD

---

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Implementasi countdown waktu adzan
- [x] Implementasi countdown waktu iqomah
- [x] Kalibrasi manual per waktu sholat
- [x] Notifikasi suara untuk countdown
- [x] Perbaikan bug floating bar sidebar

### P1 - High Priority
- [ ] Expand KHGT data untuk bulan lain (Apr-Dec 2026, 2027)
- [ ] Docker Compose deployment configuration
- [ ] Nginx reverse proxy setup
- [ ] Integration dengan GPS dari STB Android TV Box

### P2 - Medium Priority
- [ ] Homepage masjid subdomain (profil, berita)
- [ ] Kanal Ramadhan subdomain (imsakiyah, agenda tarawih)
- [ ] Admin unified dashboard for all subdomains
- [ ] Upload file audio kustom untuk notifikasi

### P3 - Low Priority
- [ ] Video content support
- [ ] Multi-language support
- [ ] Offline mode/PWA

---

## Test Credentials
- Username: `admin`
- Password: `admin123`

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET, PUT /api/mosque/identity`
- `GET, PUT /api/settings/prayer` (includes calibration)
- `GET, PUT /api/settings/layout`
- `GET /api/prayer-times`
- `GET /api/prayer-times/monthly`
- `GET, POST, PUT, DELETE /api/content`
- `GET, POST, PUT, DELETE /api/agenda`
- `GET, POST, PUT, DELETE /api/running-text`
