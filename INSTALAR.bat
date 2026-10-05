@echo off
title Instalar Blue Ocean Studio
cd /d "%~dp0"
where node >/dev/null 2>&1 || (echo Instale o Node: https://nodejs.org & pause & exit /b 1)
where ffmpeg >/dev/null 2>&1 || (echo Instale o ffmpeg:  winget install Gyan.FFmpeg & pause & exit /b 1)
echo Instalando as dependencias...
call npm install --no-audit --no-fund
node instalar.js
echo.
echo Pronto. Abra pelo atalho "Blue Ocean Studio" na Area de Trabalho.
pause
