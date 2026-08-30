# 🤖 Pengatur File Otomatis (CLI Auto File Organizer)

Utilitas baris perintah (*command-line utility*) yang dirancang khusus agar sangat mudah digunakan oleh siapa saja (termasuk orang awam) untuk merapikan folder yang berantakan seperti `Downloads` atau `Desktop` secara otomatis.

---

## ✨ Fitur Utama
- **🧙‍♂️ Mode Interaktif (Wizard)**: Cukup ketik `file-org` tanpa parameter, dan panduan interaktif berbahasa Indonesia akan menuntun Anda langkah demi langkah.
- **📂 Pengelompokan Pintar**: Memilah file secara otomatis ke dalam kategori: *Dokumen*, *Gambar*, *Video*, *Audio*, *Arsip*, *Kode & Pemrograman*, dan *Lainnya*.
- **🛡️ Aman dengan Pratinjau (Dry-Run)**: Lihat simulasi perpindahan file sebelum benar-benar dipindahkan.
- **↩️ Fitur Undo**: Salah pindah? Cukup ketik `file-org undo` untuk mengembalikan file ke posisi semula seketika.
- **🔁 Pemindaian Rekursif (`--recursive`)**: Merapikan file hingga ke dalam sub-folder.
- **⚙️ Konfigurasi Kustom (`--config`)**: Menentukan aturan dan kategori kategori file sesuai keinginan lewat file JSON.
- **📊 Statistik Folder (`stats`)**: Melihat jumlah file, ukuran total, dan distribusi per kategori dalam bentuk tabel rapi.
- **👀 Watch Mode & Notifikasi Desktop (`watch`)**: Memantau folder secara *real-time* dengan notifikasi sistem Windows saat file baru otomatis dirapikan.
- **⚡ Instalasi Mudah (`setup.bat`)**: Cukup *double-click* file `setup.bat` bagi pengguna Windows awam untuk instalasi otomatis.

---

## 📦 Instalasi & Cara Menjalankan

### Cara 1: Untuk Pengguna Windows Awam (Paling Mudah)
1. Unduh atau clone repositori ini.
2. Klik dua kali pada file **`setup.bat`**. Skrip akan otomatis menginstal semua kebutuhan dan mendaftarkan perintah `file-org`.
3. Buka Command Prompt / PowerShell, lalu ketik:
   ```bash
   file-org
   ```

### Cara 2: Instalasi Manual via Terminal
1. **Prasyarat**: Pastikan Python 3.10+ terinstal.
2. **Install Dependensi & Paket**:
   ```bash
   pip install -r requirements.txt
   pip install -e .
   ```

---

## 🚀 Perintah yang Tersedia

- **Mode Interaktif (Wizard):**
  ```bash
  file-org
  ```
- **Merapikan Folder Instan:**
  ```bash
  file-org run ~/Downloads --recursive
  ```
- **Melihat Statistik Folder:**
  ```bash
  file-org stats ~/Downloads
  ```
- **Pemantauan Otomatis (Watch Mode):**
  ```bash
  file-org watch ~/Downloads
  ```
- **Membatalkan Aksi Terakhir (Undo):**
  ```bash
  file-org undo ~/Downloads
  ```
