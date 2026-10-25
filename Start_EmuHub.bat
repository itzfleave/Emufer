@echo off
setlocal
cd /d "%~dp0"
echo Starting EmuHub...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
if errorlevel 1 (
  echo.
  echo PowerShell server failed. Trying Python instead...
  where py >nul 2>nul && (py "%~dp0serve.py" & goto :end)
  where python >nul 2>nul && (python "%~dp0serve.py" & goto :end)
  echo Python was not found either.
)
:end
pause
