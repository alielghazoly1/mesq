@echo off
rem Double-click this file to run the price calculator on this computer.
cd /d "%~dp0"
title Shein Pricer
where node >/dev/null 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed on this computer.
  echo   Download the LTS version from https://nodejs.org , install it, then double-click this file again.
  echo.
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)
if not exist ".env" if exist ".env.example" copy ".env.example" ".env" >nul
set OPEN_BROWSER=1
node server.js
echo.
pause
