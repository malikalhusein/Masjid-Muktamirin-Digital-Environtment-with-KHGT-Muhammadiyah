# 🕌 Jam Sholat Digital KHGT - Website Masjid Muktamirin

Aplikasi web lengkap untuk tampilan jadwal sholat digital dan website masjid. Mendukung TV Display, Website Publik, dan Dashboard Admin.

## 📋 Fitur Utama

### TV Display (Jam Sholat Digital)
- Tampilan jadwal sholat real-time dengan countdown
- Kalender Hijriah & Masehi
- Slideshow konten (poster, video, pengumuman)
- Running text
- Notifikasi suara adzan & iqamah
- Layout Modern & Classic

### Website Masjid
- Homepage dengan jadwal sholat
- Halaman Agenda kegiatan
- Halaman Ramadan khusus
- Halaman About Us

### Dashboard Admin
- Manajemen identitas masjid
- Kalibrasi waktu sholat
- Manajemen konten display
- Pengaturan layout & background
- Manajemen jadwal Ramadan

## 🚀 Deployment dengan Docker

### Prasyarat
- Docker & Docker Compose terinstall
- Domain yang sudah dikonfigurasi (opsional)

### Langkah Deployment

1. **Clone/Download Repository**
   ```bash
   git clone <repository-url>
   cd masjid-muktamirin
   ```

2. **Konfigurasi Environment**
   ```bash
   # Salin file environment
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit file .env sesuai kebutuhan
   nano .env
   ```

3. **Konfigurasi Penting di `.env`**
   ```bash
   # Database
   DB_NAME=masjid_db
   
   # JWT Secret - WAJIB DIGANTI!
   JWT_SECRET=secret-key-unik-anda-minimal-32-karakter
   
   # URL Backend (sesuaikan dengan domain Anda)
   REACT_APP_BACKEND_URL=https://api.masjidmuktamirin.web.id
   
   # CORS Origins
   CORS_ORIGINS=https://masjidmuktamirin.web.id,https://jamsholat.masjidmuktamirin.web.id
   ```

4. **Build & Jalankan**
   ```bash
   # Build images
   docker-compose build
   
   # Jalankan services
   docker-compose up -d
   
   # Cek status
   docker-compose ps
   ```

5. **Verifikasi**
   ```bash
   # Cek health endpoint
   curl http://localhost:8001/api/health
   
   # Cek frontend
   curl http://localhost
   ```

### Menghentikan Services
```bash
docker-compose down

# Untuk menghapus data (hati-hati!)
docker-compose down -v
```

## 🔧 Konfigurasi Subdomain (Opsional)

Untuk setup subdomain, konfigurasi nginx/reverse proxy:

| Subdomain | Route | Deskripsi |
|-----------|-------|-----------|
| `masjidmuktamirin.web.id` | `/homepage` | Website utama |
| `jamsholat.masjidmuktamirin.web.id` | `/` | TV Display |
| `ramadhan.masjidmuktamirin.web.id` | `/ramadan` | Channel Ramadan |
| `admin.masjidmuktamirin.web.id` | `/connect` | Dashboard Admin |

### Contoh Konfigurasi Nginx Reverse Proxy

```nginx
# Main website
server {
    server_name masjidmuktamirin.web.id;
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API Backend
server {
    server_name api.masjidmuktamirin.web.id;
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📁 Struktur Proyek

```
├── backend/
│   ├── Dockerfile
│   ├── server.py           # FastAPI application
│   ├── requirements.txt
│   ├── uploads/            # File uploads
│   └── .env.example
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf          # Nginx configuration
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   └── context/        # React contexts
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── DEPLOYMENT.md           # File ini
```

## 🔐 Keamanan

1. **WAJIB** ganti `JWT_SECRET` dengan nilai yang kuat
2. Gunakan HTTPS di production
3. Batasi `CORS_ORIGINS` ke domain yang valid
4. Backup database MongoDB secara berkala

## 📱 Akses Aplikasi

Setelah deployment berhasil:

| URL | Deskripsi |
|-----|-----------|
| `http://localhost` | TV Display |
| `http://localhost/homepage` | Website Homepage |
| `http://localhost/connect` | Login Admin |
| `http://localhost:8001/api/health` | Health Check |

## 🆘 Troubleshooting

### MongoDB tidak terkoneksi
```bash
# Cek status container
docker-compose ps

# Cek logs MongoDB
docker-compose logs mongodb
```

### Frontend tidak bisa akses API
- Pastikan `REACT_APP_BACKEND_URL` sudah benar
- Cek konfigurasi CORS di backend

### Port sudah digunakan
```bash
# Ubah port di docker-compose.yml
ports:
  - "3000:80"    # Ganti port frontend
  - "8002:8001"  # Ganti port backend
```

## 📞 Kontak

Untuk pertanyaan atau bantuan, hubungi administrator masjid.

---
**Dibuat dengan ❤️ untuk Masjid Muktamirin**
