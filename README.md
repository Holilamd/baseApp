# Boilerplate Laravel - React Inertia Admin Portal

Boilerplate ini adalah pondasi aplikasi web portal admin multi-tenant yang tangguh, modern, dan kaya fitur. Dirancang menggunakan kombinasi teknologi terbaik untuk menghadirkan performa cepat, visual premium yang responsif di semua perangkat, serta keamanan data tingkat tinggi.

---

## 🚀 Fitur Utama Boilerplate

### 1. Panel Dashboard Interaktif & Dinamis
- Visualisasi ringkasan wawasan data portal secara instan.
- Grafik visual terintegrasi (SVG charts) dengan transisi mulus dan indikator performa modern.

### 2. Manajemen Pengguna & Hak Akses (RBAC)
- **User Management**: Mengelola daftar akun pengguna portal.
- **Role Management**: Pemetaan peran akses dengan mencentang izin spesifik secara fleksibel.
- **Menu Management**: Konfigurasi menu navigasi secara dinamis langsung dari database.

### 3. Ruang Obrolan Real-Time (Chat Room)
Sistem chat canggih yang terintegrasi secara modular:
- **Direct Messages (DMs) & Group Chat**: Mengobrol langsung antar personal maupun membentuk grup baru dengan modal pemilihan member yang instan.
- **Panggilan Suara & Video (WebRTC)**: Fitur p2p call langsung antar browser tanpa membebani bandwidth server Anda, dilengkapi kontrol mic mute, camera on/off, dan panggilan masuk overlay yang responsif.
- **Unggah Berkas & Paste Gambar**: Mendukung pengiriman screenshot langsung via shortcut `Ctrl+V` (paste) serta pemilihan berkas lampiran (PDF, ZIP, Excel, dll.) hingga 20MB.
- **Centang Biru (Read Receipts)**: Mengetahui status keterbacaan pesan (centang abu-abu = terkirim, centang biru = dibaca).
- **Auto-Delete (Kebersihan DB)**: Menghapus riwayat chat yang sudah dibaca otomatis dalam batas waktu tertentu (dikonfigurasi via `.env`) serta membersihkan log sinyal WebRTC setiap 5 menit.
- **Enkripsi AES-256**: Mengamankan isi kolom pesan di database secara otomatis dengan algoritma enkripsi militer.

### 4. Sistem Ekspor Laporan (Reports Service)
- Membantu ekspor laporan data ke 3 format dokumen sekaligus: **PDF**, **Excel**, dan **Word (Docx)**.
- Desain template yang rapi, *printer-friendly*, lengkap dengan tata letak kop surat profesional.

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: Laravel (PHP 8.2+) dengan arsitektur RESTful API & Service Layer.
- **Frontend**: React.js (JavaScript) + Vite.
- **Jembatan Penghubung**: Inertia.js (menghilangkan kebutuhan routing API terpisah untuk frontend).
- **Desain & Styling**: Tailwind CSS (Desain modern, dark mode, transisi lembut, dan *mobile-responsive* penuh).
- **Real-Time & P2P**: WebRTC (untuk voice/video call) & Laravel Echo.
- **Basis Data**: MySQL (dengan relasi terindeks untuk kecepatan query).

---

## 📸 Dokumentasi Menu Aplikasi

### 1. Halaman Login (Premium Dark Theme Split Screen)
![Halaman Login](/images/screenshots/login.png)

### 2. Dashboard Portal Utama
![Dashboard](/images/screenshots/dashboard.png)

### 3. User Management
![User Management](/images/screenshots/user_management.png)

### 4. Role Management (Role & Permissions)
![Role Management](/images/screenshots/role_management.png)

### 5. Menu Management (Daftar Navigasi)
![Menu Management](/images/screenshots/menu_management.png)

### 6. Tenant Settings (Multi-tenant Domain)
![Tenant Settings](/images/screenshots/tenant_settings.png)

### 7. Chat Room & WebRTC Call (Direct Message, Grup, Kirim File & Panggilan)
![Chat Room](/images/screenshots/chat_room.png)

### 8. Laporan Dokumen (PDF, Excel, Word Export)
![Reports](/images/screenshots/reports.png)

---

## ⚙️ Langkah Instalasi & Penggunaan

Ikuti langkah berikut untuk memasang boilerplate ini di komputer lokal Anda:

### 1. Clone & Masuk ke Folder Project
```bash
git clone https://github.com/Holilamd/baseApp.git
cd baseApp
```

### 2. Pasang Dependensi Composer (PHP) & NPM (Javascript)
```bash
composer install
npm install
```

### 3. Salin Konfigurasi Environment & Buat Kunci Aplikasi
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi Database di `.env`
Buka file `.env` dan sesuaikan koneksi database Anda, serta tentukan waktu pembersihan otomatis chat:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hadiri
DB_USERNAME=root
DB_PASSWORD=

# Umur penyimpanan chat yang sudah dibaca (dalam satuan jam, default: 12)
CHAT_AUTO_DELETE_HOURS=12
```

### 5. Jalankan Migrasi Database & Seeder Bawaan
Perintah ini akan membuat semua struktur tabel (termasuk modul chat, grup, dan izin akses) serta mengisi akun administrator bawaan:
```bash
php artisan migrate --seed
```
*Akun Login Admin Bawaan:*
- **Email**: `admin@hadiri.com`
- **Password**: `password`

### 6. Hubungkan Folder Upload Publik
Agar berkas lampiran chat atau file unggahan dapat diakses secara publik oleh browser:
```bash
php artisan storage:link
```

### 7. Jalankan Server Pengembangan Lokal
Jalankan kedua perintah ini di tab terminal terpisah untuk mengaktifkan backend Laravel dan penyusun aset frontend Vite:
```bash
# Terminal 1: Server Laravel
php artisan serve

# Terminal 2: Vite Dev Server
npm run dev
```
Akses portal admin melalui browser di alamat: **`http://localhost:8000`**

---

## 👨‍💻 Informasi Pengembang (Developer)

- **Nama**: Kholil
- **Email**: [holil.amd@gmail.com](mailto:holil.amd@gmail.com)
- **No. HP / WhatsApp**: +62 813-1815-5813
