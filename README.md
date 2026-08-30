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
- **👀 Watch Mode (`watch`)**: Memantau folder secara *real-time* — file baru yang masuk akan otomatis dirapikan seketika.

---

## 📦 Instalasi & Cara Menjalankan

1. **Prasyarat**: Pastikan Python 3.10+ terinstal di komputer Anda.
2. **Install Dependensi & Paket Secara Global**:
   ```bash
   pip install -e .
   ```
3. **Menjalankan Aplikasi**:
   - **Mode Interaktif (Pemula):**
     ```bash
     file-org
     ```
   - **Mode Instan (Folder tertentu):**
     ```bash
     file-org run ~/Downloads
     ```
   - **Melihat Pratinjau (Dry-Run):**
     ```bash
     file-org run ~/Downloads --dry-run
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
