@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto nonode
echo Fermeture des anciennes fenetres du site...
for %%p in (8787 5173 5174) do for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo Verification des composants (rapide si deja installes)...
call npm install
echo Demarrage du site...
call npm run dev:all
goto fin
:nonode
echo Node.js n'est pas installe. Telechargez la version LTS sur https://nodejs.org puis relancez ce fichier.
:fin
echo.
pause
