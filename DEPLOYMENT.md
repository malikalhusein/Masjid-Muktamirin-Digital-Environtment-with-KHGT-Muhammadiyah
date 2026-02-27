# Panduan Deployment Sistem Masjid Muktamirin

Dokumen ini berisi panduan komprehensif untuk mendikompilasi dan mendeploy aplikasi Jam Sholat Digital & Sistem Informasi Masjid Muktamirin. Sistem ini dirancang untuk dapat di-*host* sendiri (Self-Hosted) menggunakan **1Panel** sebagai control panel dan **Cloudflare Tunnel** untuk mengamankan dan mengekspos aplikasi ke publik tanpa perlu membuka port (port-forwarding) di router Anda.

---

## 1. Persiapan Server & Prasyarat
Untuk mendeploy sistem ini dengan lancar, pastikan Anda memiliki:
1. Sebuah Server/VPS atau Mini PC (bisa juga Raspberry Pi) yang terhubung ke internet.
2. Sistem Operasi berbasis Linux (disarankan **Ubuntu 22.04 LTS** atau Debian).
3. Akses ke domain Anda (misal `masjidmuktamirin.web.id`) di **Cloudflare**.
4. RAM minimal 2GB (direkomendasikan 4GB).

---

## 2. Instalasi 1Panel (Control Panel Server)
[1Panel](https://1panel.cn/docs/en/) adalah panel manajemen server modern berbasis Docker yang sangat memudahkan instalasi database dan manajemen container.

1. Buka terminal/SSH ke server Anda.
2. Jalankan skrip instalasi 1Panel:
   ```bash
   curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
   ```
3. Ikuti instruksi di layar (buat port admin, username, dan password).
4. Setelah selesai, masuk ke Dashboard 1Panel melalui browser: `http://[IP_SERVER]:[PORT_1PANEL]`.

---

## 3. Instalasi MongoDB via 1Panel
Aplikasi ini membutuhkan MongoDB minimal versi 6.0.

1. Di Dashboard 1Panel, masuk ke menu **App Store**.
2. Cari aplikasi **MongoDB** lalu klik **Install**.
3. Centang opsi *Allow External Access* bila diperlukan, namun untuk keamanan tetap biarkan lokal (port 27017) jika backend akan di-deploy di 1Panel yang sama.
4. Tentukan *Root Password* untuk MongoDB Anda. Ingat password ini!
5. Klik **Confirm** dan tunggu hingga instalasi Database selesai.

> **Catatan Penting Keamanan Data:**  
> Selalu pastikan Volume MongoDB di-mount ke *persistent storage* agar data user, artikel, dan pengaturan tidak hilang saat server di-restart.

---

## 4. Deployment Aplikasi (Docker Compose via 1Panel)
Aplikasi kita (Backend FastAPI & Frontend React) sudah memiliki `docker-compose.yml`.

1. Di 1Panel, masuk ke menu **Websites** -> **Runtime** (atau **Containers** -> **Compose**).
2. Klik tombol **Create Compose** / **Add Compose**.
3. Beri nama proyek: `masjid-muktamirin`.
4. Pilih metode **Path** atau **Git Repository** (jika kode sudah ditekan ke GitHub).
5. Pada bagian `docker-compose.yml`, pastikan isinya mencakup *services* `backend` dan `frontend`.
6. Jangan lupa mengatur file `.env` untuk Backend dan Frontend.
   
   **Contoh `.env` Backend:**
   ```env
   MONGO_URL=mongodb://root:[PASSWORD_MONGO_ANDA]@mongo:27017
   DB_NAME=masjid_db
   CORS_ORIGINS=https://masjidmuktamirin.web.id,https://admin.masjidmuktamirin.web.id
   JWT_SECRET=GantiDenganSecretKeyYangSuperAman
   ```
   
   **Contoh `.env` Frontend:**
   ```env
   REACT_APP_BACKEND_URL=https://api.masjidmuktamirin.web.id
   ```
   
7. Klik **Confirm / Deploy**. 1Panel akan men-download *image* (membangun *image*) dan menjalankan *container* frontend dan backend.

---

## 5. Menghubungkan ke Domain Publik (Cloudflare Tunnel)
Karena server mungkin berada di dalam jaringan lokal masjid (tanpa IP Publik Statis) atau Anda ingin menghindari *DDoS*, solusi terbaik adalah menggunakan **Cloudflare Tunnel (Zero Trust)**. Anda tidak perlu repot setup Nginx HTTPS atau membuka port router.

### Langkah A: Setup Cloudflare Zero Trust
1. Login ke dashboard [Cloudflare](https://dash.cloudflare.com) dan pilih domain `masjidmuktamirin.web.id`.
2. Di menu kiri, masuk ke **Zero Trust** -> **Networks** -> **Tunnels**.
3. Klik tombol **Create a tunnel**.
4. Pilih **Cloudflared** dan beri nama tunnel (misal: `masjid-server`).
5. Cloudflare akan memberikan sebuah perintah *Install and run a connector*. Pilih OS sesuai server Anda (misal Linux 64-bit).
6. Salin perintah instalasi token tersebut dan jalankan di terminal server Anda.
   ```bash
   sudo cloudflared service install eyJh...[TOKEN_PANJANG_ANDA]
   ```
7. Jika koneksi di Cloudflare Dashboard sudah bewarna hijau (Healthy), klik **Next**.

### Langkah B: Routing Domain ke Localhost
Di tahap *Route traffic*, kita akan mengaitkan domain (subdomain) publik Anda ke port aplikasi lokal di server. Setup 3 rute ini:

| Public Hostname | Service | URL |
|---|---|---|
| `masjidmuktamirin.web.id` | HTTP | `localhost:3000` (Port Frontend Web) |
| `admin.masjidmuktamirin.web.id` | HTTP | `localhost:3000` (Port Frontend Web) |
| `api.masjidmuktamirin.web.id` | HTTP | `localhost:5005` (Port Backend API) |

> **Catatan:** Ganti `localhost:3000` dan `localhost:5005` dengan IP lokal *container* Docker atau host jika Anda membungkus network di Docker. 

Kini, website Anda dapat diakses secara global, sepenuhnya dienkripsi oleh HTTPS Cloudflare, dan backend Anda tetap tersembunyi dengan aman!

---

## 6. Integrasi Akun & Sinkronisasi
Setelah aplikasi online:
1. Buka `https://admin.masjidmuktamirin.web.id/connect`
2. Login dengan akun yang telah di-*seed* di database (Default role: Administrator).
3. Segera arahkan ke **Pengaturan Sistem -> Administrator** dan ubah password Anda.
4. Konfigurasikan *Google Sheets* pada menu ZIS sesuai instruksi `settings` di Dashboard untuk memastikan Laporan Zakat tersinkronisasi.
