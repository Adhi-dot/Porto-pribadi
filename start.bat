@echo off
title The 11th-Grade War Room - Launcher
echo ========================================================
echo   THE 11TH-GRADE WAR ROOM (Anti-Burnout Hustle Co-Pilot)
echo ========================================================
echo.

echo [1/3] Menyiapkan Backend & Database...
cd backend
if not exist "node_modules" (
    echo Menginstall dependensi backend...
    call npm install
)
if not exist "prisma\dev.db" (
    echo Menjalankan migrasi database Prisma...
    call npx prisma migrate dev --name init --skip-generate
    call npx prisma generate
)

echo [2/3] Menyiapkan Frontend...
cd ../frontend
if not exist "node_modules" (
    echo Menginstall dependensi frontend...
    call npm install
)

echo.
echo [3/3] Menjalankan Server (Backend di port 5000, Frontend di port 5173)...
start cmd /k "cd /d %~dp0backend && npm run dev"
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   APLIKASI BERHASIL DIJALANKAN!
echo   Buka browser dan akses: http://localhost:5173
echo ========================================================
pause
