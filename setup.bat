@echo off
TITLE Instalasi Pengatur File Otomatis (CLI)
color 0A
echo ========================================================
echo       MEMULAI INSTALASI PENGATUR FILE OTOMATIS
echo ========================================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan di komputer Anda!
    echo Harap instal Python terlebih dahulu dari https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Menginstal dependensi yang diperlukan...
pip install -r requirements.txt

echo [2/3] Mendaftarkan perintah global 'file-org'...
pip install -e .

echo.
echo ========================================================
echo       [SUKSES] INSTALASI SELESAI DENGAN SEMPURNA!
echo ========================================================
echo Anda sekarang dapat membuka Command Prompt / PowerShell
echo dan mengetikkan 'file-org' untuk mulai merapikan folder Anda.
echo.
pause
