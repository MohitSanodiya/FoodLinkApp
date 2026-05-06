@echo off
echo =======================================================
echo    Downloading Portable Node.js (No Admin Required)
echo =======================================================
echo.

echo [1/3] Downloading Node.js v20 LTS...
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.12.2/node-v20.12.2-win-x64.zip' -OutFile 'node.zip'"

echo [2/3] Extracting Node.js...
powershell -Command "Expand-Archive -Path 'node.zip' -DestinationPath 'node_portable' -Force"

echo [3/3] Cleaning up...
del node.zip

echo.
echo Node.js successfully installed locally!
echo You can now run the start-all.bat file to launch the project.
pause
