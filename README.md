# Jam Sholat Digital KHGT Muhammadiyah

Web App Jam Sholat Digital berbasis **Kalender Hijriyah Global Tunggal (KHGT) Muhammadiyah**, siap di-deploy di VPS/self-hosted. Aplikasi ini ditampilkan di TV masjid melalui STB Android TV Box dalam mode fullscreen, dengan panel dashboard untuk konfigurasi dan manajemen konten.

## ✨ Tujuan
- Menyediakan jadwal shalat akurat sesuai KHGT Muhammadiyah (bukan Kemenag).
- Menampilkan countdown adzan & iqomah.
- Menyediakan konten edukatif dan agenda masjid untuk jamaah.
- Memberikan dashboard admin terintegrasi untuk takmir masjid.

## 📚 Referensi Data & Repository
- [KHGT Muhammadiyah](https://khgt.muhammadiyah.or.id/)
- [Kalender KHGT Online](https://hisabmu.com/khgt/)
- [Jadwal Shalat KHGT](https://hisabmu.com/shalatmu/)
- [API Jadwal Shalat KHGT](https://hisabmu.com/shalat/?latitude=-7.0667&longitude=110.4&elevation=230&timezone=7&dst=auto&method=MU&ikhtiyat=16)

### GitHub Repository Acuan
- [kasmui/khgt](https://github.com/kasmui/khgt)
- [mitsociety/khgt-desk](https://github.com/mitsociety/khgt-desk)
- [mitsociety/kalender_hgt](https://github.com/mitsociety/kalender_hgt)

## 🛠️ Fitur Utama
1. **Display Identitas Masjid**  
   Nama, logo, alamat masjid ditampilkan di layar utama.

2. **Pilihan Layout**  
   Template tampilan (klasik, modern, Ramadhan, Hari Besar Islam).

3. **Jadwal Shalat KHGT**  
   Tarik data dari API hisabmu.com sesuai latitude, longitude, timezone. Sinkronisasi otomatis setiap hari.

4. **Countdown Waktu Adzan & Iqomah**  
   Timer visual besar, warna berubah saat mendekati waktu. Durasi iqomah bisa diatur via dashboard.

5. **Konten Jamaah**  
   Upload poster, foto, video, pengumuman via dashboard. Ditampilkan bergantian di layar (slideshow, video player, running text).

6. **Agenda Masjid**  
   Modul agenda untuk kajian, pengajian, kegiatan sosial.

7. **Kalender Hijriyah & Masehi**  
   Sinkronisasi kalender KHGT untuk Hijriyah, ditampilkan berdampingan dengan kalender Masehi.

8. **Dashboard Admin**  
   URL: `admin.masjidmuktamirin.web.id`  
   - Input identitas masjid  
   - Upload konten jamaah  
   - Input agenda masjid  
   - Pilih layout tampilan  
   - Set durasi iqomah  

## 🏗️ Arsitektur Teknis
- **Backend:** Node.js + Express (API proxy KHGT, database agenda/konten/identitas).
- **Frontend:** React (komponen jadwal shalat, countdown, kalender, agenda, konten, dashboard).
- **Database:** PostgreSQL/MongoDB.
- **Deployment:** VPS/self-hosted dengan Docker Compose.
- **Reverse Proxy:** Nginx/Traefik untuk routing subdomain.
- **Display:** STB Android TV Box membuka URL → fullscreen di TV.

## 📂 Struktur Project
```
jam-sholat-digital/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── config/
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   └── public/
└── docker-compose.yml
```

## 🚀 Deployment
1. Clone repository:
   ```bash
   git clone https://github.com/username/jam-sholat-digital.git
   cd jam-sholat-digital
   ```
2. Konfigurasi environment (`.env`):
   ```
   DOMAIN=jamsholat.masjidmuktamirin.web.id
   API_ENDPOINT=https://hisabmu.com/shalat
   LATITUDE=-7.0667
   LONGITUDE=110.4
   TIMEZONE=7
   ```
3. Jalankan dengan Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. Akses:
   - `jamsholat.masjidmuktamirin.web.id` → Display Jam Sholat Digital
   - `admin.masjidmuktamirin.web.id` → Dashboard Admin

## 🌐 Future Integration
- **Homepage Masjid:** `masjidmuktamirin.web.id` → profil, berita, jadwal kajian, galeri.
- **Kanal Ramadhan:** `ramadan.masjidmuktamirin.web.id` → imsakiyah KHGT, agenda tarawih, konten Ramadhan.
- **Dashboard Terpusat:** satu panel untuk mengatur semua modul/subdomain.

## 📜 Lisensi
Proyek ini open-source dengan lisensi MIT. Silakan gunakan, modifikasi, dan kembangkan untuk kebutuhan masjid dan komunitas.

---
```
