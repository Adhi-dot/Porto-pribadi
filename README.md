# 🤖 Pengatur File Otomatis (CLI Auto File Organizer)

Utilitas baris perintah (*command-line utility*) yang dirancang khusus agar sangat mudah digunakan oleh siapa saja (termasuk orang awam) untuk merepikan folder yang berantakan seperti `Downloads` atau `Desktop` secara otomatis.

---

## ✨ Fitur Utama
- **🧙‍♂️ Mode Interaktif (Wizard)**: Cukup ketik `file-org` tanpa parameter, dan panduan interaktif berbahasa Indonesia akan menuntun Anda langkah demi langkah.
- **📂 Pengelompokan Pintar**: Memilah file secara otomatis ke dalam kategori: *Dokumen*, *Gambar*, *Video*, *Audio*, *Arsip*, *Kode & Pemrograman*, dan *Lainnya*.
- **🛡️ Aman dengan Pratinjau (Dry-Run)**: Lihat simulasi perpindahan file sebelum benar-benar dipindahkan.
- **↩️ Fitur Undo**: Salah pindah? Cukup ketik `file-org undo` untuk mengembalikan file ke posisi semula seketika.

---

## 📦 Instalasi & Cara Menjalankan

1. **Prasyarat**: Pastikan Python 3.10+ terinstal di komputer Anda.
2. **Install Dependensi**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Menjalankan Aplikasi**:
   - **Mode Interaktif (Pemula):**
     ```bash
     python -m organizer.cli
     ```
   - **Mode Instan (Folder tertentu):**
     ```bash
     python -m organizer.cli run ~/Downloads
     ```
   - **Melihat Pratinjau (Dry-Run):**
     ```bash
     python -m organizer.cli run ~/Downloads --dry-run
     ```
   - **Membatalkan Aksi Terakhir (Undo):**
     ```bash
     python -m organizer.cli undo ~/Downloads
     ```
