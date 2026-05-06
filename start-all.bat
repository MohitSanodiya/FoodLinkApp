@echo off
echo =========================================
echo    Starting FoodLink AI Project...
echo =========================================

:: Add local Node.js to PATH temporarily for these windows
set PATH=%~dp0node_portable\node-v20.12.2-win-x64;%PATH%

echo.
echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "FoodLink Spring Boot Backend" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"

echo.
echo [2/3] Starting Admin Node Backend (Port 5001)...
start "FoodLink Node Backend" cmd /k "cd node-backend && npm install && npm start"

echo.
echo [3/3] Starting Frontend Server (Port 3000)...
start "FoodLink Frontend" cmd /k "node serve-frontend.js"

echo.
echo All components have been launched in separate windows!
echo Please ALLOW any Windows Defender / Firewall prompts if they appear.
echo.
echo Once they finish starting up, open your browser to:
echo http://localhost:3000
echo.
pause
