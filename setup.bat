@echo off
echo 🧠 CogniFlow Setup Script
echo =========================

REM Check if Ollama is installed
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama not found. Please install Ollama first:
    echo    Visit: https://ollama.ai
    pause
    exit /b 1
)

echo ✅ Ollama found

REM Pull Gemma model
echo 📥 Pulling Gemma 2B model...
ollama pull gemma2:2b

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not running. Please start Docker first.
    pause
    exit /b 1
)

REM Start MongoDB container
echo 🐳 Starting MongoDB container...
docker run -d -p 27017:27017 --name cogniflow-mongodb mongo:latest

REM Wait for MongoDB to be ready
echo ⏳ Waiting for MongoDB to be ready...
timeout /t 5 /nobreak >nul

REM Install dependencies
echo 📦 Installing dependencies...
npm install

echo ✅ Setup complete!
echo.
echo 🚀 To start CogniFlow:
echo    npm start
echo.
echo 📊 Then open: http://localhost:3000
echo.
echo 💡 Make sure Ollama is running: ollama serve
pause
