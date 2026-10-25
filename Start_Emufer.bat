@echo off
cd /d "%~dp0"
echo Starting Emufer local server...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
