# Masjid Muktamirin - Digital Mosque Management System

Sistem manajemen masjid digital lengkap dengan tampilan TV Display, Website Publik, dan Dashboard Admin.

## Fitur Utama

### TV Display (jamsholat.masjidmuktamirin.web.id)
- Jadwal sholat real-time berbasis **API Hisabmu.com (KHGT Muhammadiyah)** otomatis mengikuti tata letak Latitude dan Longitude
- Countdown waktu sholat berikutnya
- Running text pengumuman
- Slideshow konten (poster, video)
- Tanggal Hijriyah otomatis

### Website Publik (masjidmuktamirin.web.id)
- Homepage dengan jadwal sholat, agenda, ZIS summary, quote islami
- Galeri foto kegiatan dengan slider
- Halaman Agenda dengan kalender interaktif
- Halaman Informasi laporan ZIS dengan grafik
- Halaman Tentang Kami dengan sejarah, donasi, dan kontak
- Responsive design (mobile-friendly)

### Dashboard Admin (admin.masjidmuktamirin.web.id)
- Manajemen identitas masjid (logo, nama, profil)
- Konfigurasi Lokasi (embed Google Maps dan pencarian otomatis) untuk akurasi jadwal sholat
- Manajemen konten (agenda, pengumuman, artikel)
- Laporan ZIS Terintegrasi (Zakat, Infaq, Shodaqoh dan Pengeluaran)
- Sinkronisasi Laporan ZIS otomatis ke Google Sheets
- Galeri foto kegiatan berdasarkan kategori (Umum, Ramadan, Idulfitri)
- Struktur pengurus takmir
- Event khusus
- Quote islami
- Pengaturan QRIS & rekening donasi
- Endpoint Scraping Jadwal Sholat Dinamis ke Hisabmu KHGT
- Manajemen Pengguna (Role-based access: Administrator & Editor)

## Pembaruan Rilis Terakhir
- **Dinamisasi Jadwal Sholat**: Menonaktifkan data kalender statis (built-in backend) dan bertransisi sepenuhnya menggunakan API Scraper ke `hisabmu.com`. Menyesuaikan jadwal berdasarkan posisi kordinat (*Latitude, Longitude*, Elevasi, TZ).
- **Auto-Search Peta**: Penambahan *Embed* Google Maps interaktif dan integrasi *Nominatim OpenStreetMap* untuk fitur pencarian alamat di Dashboard Admin, guna memudahkan pencarian titik kordinat masjid.
- **Kemanan Sistem**: Form pendaftaran (Register) dimatikan dari publik. Tata kelola User kini dikendalikan penuh oleh opsi "Administrator" (CRUD & Role-based) di Dasbor Admin.
- **ZIS Google Sheets**: Export & Sinkronisasi instan *one-click* (sekali klik) dari aplikasi sistem zakat infaq masjid langsung menuju ke spreadsheet Google Sheets Akuntansi Masjid Muktamirin.

## Tech Stack

- **Backend:** Python 3.11, FastAPI, MongoDB, Motor (async)
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Charts:** Recharts
- **Calendar:** FullCalendar
- **Auth:** JWT (PyJWT, bcrypt)
- **Deployment:** Docker, Docker Compose, Nginx

## Struktur Proyek

```
/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── seed_ramadan.py    # Ramadan schedule seeder
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API & utilities
│   │   └── context/       # React context
│   ├── package.json
│   └── .env
├── docker-compose.yml
├── Dockerfile
├── DEPLOYMENT.md
└── README.md
```

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6+

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL

# Run server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with backend URL

# Run development server
yarn start
```

## Deployment dengan Docker

### Prerequisites
- Docker & Docker Compose
- Domain dengan DNS pointing ke server
- SSL certificate (recommended: Cloudflare)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/masjid-muktamirin.git
cd masjid-muktamirin
```

### 2. Konfigurasi Environment

**Backend (.env):**
```env
MONGO_URL=mongodb://mongo:27017
DB_NAME=masjid_db
CORS_ORIGINS=https://masjidmuktamirin.web.id,https://admin.masjidmuktamirin.web.id
JWT_SECRET=your-super-secret-jwt-key-change-this
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://api.masjidmuktamirin.web.id
```

### 3. Build & Deploy
```bash
# Build dan jalankan semua services
docker-compose up -d --build

# Lihat logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Konfigurasi Nginx (Reverse Proxy)

Contoh konfigurasi untuk subdomain routing:

```nginx
# Main website
server {
    listen 80;
    server_name masjidmuktamirin.web.id www.masjidmuktamirin.web.id;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend
server {
    listen 80;
    server_name api.masjidmuktamirin.web.id;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Admin Dashboard
server {
    listen 80;
    server_name admin.masjidmuktamirin.web.id;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 5. Setup SSL dengan Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificates
sudo certbot --nginx -d masjidmuktamirin.web.id -d www.masjidmuktamirin.web.id
sudo certbot --nginx -d api.masjidmuktamirin.web.id
sudo certbot --nginx -d admin.masjidmuktamirin.web.id
```

## Deployment dengan 1Panel (Recommended)

1Panel adalah panel manajemen server yang memudahkan deployment:

### 1. Install 1Panel
```bash
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```

### 2. Di 1Panel Dashboard:
1. **Install Apps:** MongoDB, Docker
2. **Websites:** Buat website baru dengan reverse proxy
3. **SSL:** Generate SSL gratis dengan Let's Encrypt
4. **Backup:** Setup backup otomatis untuk MongoDB

### 3. Deploy via Git
1. Buka menu **Websites > Runtime**
2. Pilih **Docker Compose**
3. Link repository GitHub
4. Konfigurasi environment variables
5. Deploy!

## API Documentation

Setelah server berjalan, dokumentasi API tersedia di:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

### Endpoints Utama

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login admin |
| GET | /api/mosque/identity | Get mosque info |
| PUT | /api/mosque/identity | Update mosque info |
| GET | /api/prayer-times | Get prayer times |
| GET | /api/agenda | Get agenda list |
| GET | /api/gallery | Get gallery items |
| GET | /api/zis/summary | Get ZIS summary |
| GET | /api/quotes/random | Get random quote |
| GET | /api/articles | Get articles |
| GET | /api/announcements | Get announcements |

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |

**Penting:** Ganti password default setelah deployment pertama!

## Konfigurasi Tambahan

### Backup MongoDB
```bash
# Manual backup
docker exec -it mongodb mongodump --out /backup/$(date +%Y%m%d)

# Restore
docker exec -it mongodb mongorestore /backup/20260222
```

### Monitoring dengan 1Panel
1. Buka **Monitor** di 1Panel
2. Setup alerts untuk CPU, Memory, Disk
3. Aktifkan container monitoring

## Troubleshooting

### Backend tidak bisa connect ke MongoDB
```bash
# Check MongoDB status
docker-compose logs mongo

# Verify connection string di .env
MONGO_URL=mongodb://mongo:27017
```

### ⚠️ WARNING: Kehilangan Data di Local Development (Mac/Linux)
Jika Anda me-restart komputer lalu menjalankan MongoDB lokal (`mongod`), pastikan **selalu** menggunakan `--dbpath` yang benar, tempat data lama Anda tersimpan. Secara default Homebrew menyimpannya di `/opt/homebrew/var/mongodb`.

**JANGAN** menjalankan `mongod` di path `/tmp` atau direktori kosong lainnya, karena seluruh user (termasuk admin) akan hilang dan backend akan gagal memuat data!

```bash
# Cara yang BENAR untuk menjalankan MongoDB lokal:
mongod --port 27018 --dbpath /opt/homebrew/var/mongodb &
```

### Frontend blank/error
```bash
# Check frontend logs
docker-compose logs frontend

# Verify REACT_APP_BACKEND_URL
```

### CORS Error
Pastikan domain frontend ada di `CORS_ORIGINS` backend .env

## Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## License

MIT License - silakan gunakan dan modifikasi sesuai kebutuhan.

## Kontak

Masjid Muktamirin Sorogaten
- WhatsApp: 0812-1554-551
- Instagram: @masjid_muktamirin_sorogaten
- Alamat: Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Kec. Galur, Kab. Kulon Progo, DIY 55661

---

Dibuat dengan untuk Masjid Muktamirin Sorogaten
