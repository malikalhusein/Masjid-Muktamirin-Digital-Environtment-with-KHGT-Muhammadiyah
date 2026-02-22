# Jam Sholat Digital KHGT Muhammadiyah - PRD

## Original Problem Statement
Bangun sebuah Web App Jam Sholat Digital berbasis KHGT Muhammadiyah, siap di-deploy di VPS/self-hosted, dengan panel dashboard untuk konfigurasi dan manajemen konten.

**Extended Scope:** Proyek berkembang menjadi ekosistem website masjid lengkap dengan:
- TV Display (jamsholat.masjidmuktamirin.web.id)
- Website Publik (masjidmuktamirin.web.id)
- Channel Ramadan (ramadhan.masjidmuktamirin.web.id)
- Dashboard Admin (admin.masjidmuktamirin.web.id)

## User Personas
1. **Takmir/Pengurus Masjid** - Admin yang mengelola konten via dashboard
2. **Jamaah Masjid** - Pengguna yang melihat display TV atau website
3. **Pengunjung Website** - Melihat jadwal sholat, agenda, dan info masjid online

## Tech Stack
- Backend: FastAPI, MongoDB, Motor (async)
- Frontend: React 19, Tailwind CSS, Shadcn/UI, Framer Motion, Recharts, FullCalendar
- Auth: JWT (PyJWT, bcrypt), Role-based (admin/editor)
- Deployment: Docker, Docker Compose, Nginx

---

## What's Been Implemented

### Update: 22 Februari 2026 - Major AboutPage Revamp & Documentation

#### 1. README.md untuk GitHub
- Dokumentasi lengkap untuk deployment
- Quick Start guide untuk development
- Docker deployment instructions
- Nginx reverse proxy configuration
- Troubleshooting guide

#### 2. AboutPage dengan Tabs
- **Tab Informasi**: Artikel & Berita, Pengumuman, Galeri Preview, Pengurus Takmir
- **Tab Donasi & Infaq**: QRIS image, Bank BSI (7148254552), Program Infaq
- **Tab Kontak**: Form kontak (redirect WhatsApp), Info kontak, Pengurus

#### 3. Sejarah Masjid Baru
- Redaksi sejarah lengkap (berdiri 1907, renovasi 1977, kisah Pangeran Diponegoro)
- **Highlight Cards**: Didirikan 1907, Renovasi Besar 1977, Terbuka 24/7
- Profile section dengan foto (jika ada)

#### 4. Dedicated Gallery Page
- Route: `/homepage/gallery`
- Lightbox dengan navigasi (prev/next)
- Back button ke About page
- Tidak ada navbar (sesuai request)

#### 5. Admin Dashboard - Identity Enhancement
- Field **Deskripsi/Sejarah Masjid** (textarea)
- Upload **Foto Profil Masjid**
- Teks akan tampil di halaman "Tentang Kami"

---

### Previous Implementation (22 Februari 2026 - Earlier)

#### P0 Features (COMPLETED)
- Responsive Navigation dengan burger menu
- Logo dari API `mosqueIdentity.logo_url`
- Gallery slider di homepage
- Weekly agenda compact

#### Backend API (All CRUD + Auth)
- ZIS, Announcements, Pengurus, Events, Gallery, Quotes, Articles, QRIS

#### Website Publik
- Homepage, Agenda, About, Informasi (ZIS charts)

#### Docker Deployment
- Dockerfile, docker-compose.yml, DEPLOYMENT.md

---

## Database Models

```
users: {username, password_hash, name, role}
identity: {name, address, logo_url, description, profile_image_url, latitude, longitude, elevation, timezone_offset}
zis_reports: {type, amount, date, month, year, donor_name, description}
announcements: {title, content, category, is_active, priority}
pengurus: {name, position, period, photo_url, phone, order}
gallery: {title, image_url, description, event_date, order, is_active}
articles: {title, content, author, date}
```

---

## Prioritized Backlog

### P0 - Critical (COMPLETED)
- [x] README.md dokumentasi untuk GitHub
- [x] AboutPage dengan tabs (Informasi, Donasi, Kontak)
- [x] Sejarah masjid dengan highlight cards
- [x] Dedicated Gallery page `/homepage/gallery`
- [x] Admin: Deskripsi masjid editable
- [x] Admin: Profile image upload

### P1 - High Priority (Next)
- [ ] Role-Based Access Control (RBAC) - protect API endpoints
- [ ] RBAC - conditional UI rendering based on user role
- [ ] Artikel detail page (click to read full article)

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
- **Admin:** username=`admin`, password=`admin123`

## Key Information
- **QRIS**: BSI 7148254552 a.n. Masjid Muktamirin
- **WhatsApp**: 628121554551
- **Instagram**: @masjid_muktamirin_sorogaten

---

## File Architecture

```
/app/
├── README.md               # NEW: GitHub documentation
├── backend/
│   ├── server.py           # Updated: description, profile_image_url fields
│   └── tests/
│       └── test_new_features.py  # NEW: Test file
├── frontend/
│   └── src/
│       ├── App.js          # Updated: GalleryPage routes
│       └── pages/
│           ├── website/
│           │   ├── AboutPage.jsx     # REWRITTEN: Tabs, history, cards
│           │   └── GalleryPage.jsx   # NEW: Dedicated gallery
│           └── Dashboard/
│               └── IdentityPage.jsx  # Updated: description, profile upload
└── memory/
    └── PRD.md
```

---

## Changelog

### 22 Februari 2026
- Created README.md with deployment documentation
- Rewrote AboutPage with Tabs (Informasi, Donasi & Infaq, Kontak)
- Added mosque history with Pangeran Diponegoro story
- Added highlight cards (1907, 1977, 24/7)
- Created dedicated GalleryPage at /homepage/gallery
- Updated IdentityPage with description textarea and profile image upload
- Updated MosqueIdentity model with description and profile_image_url fields
