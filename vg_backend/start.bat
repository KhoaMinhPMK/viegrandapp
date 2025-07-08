@echo off
echo 🚀 Starting VieGrand Backend...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call yarn install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found, copying from .env.example...
    copy .env.example .env
    echo ✅ Please configure your .env file before running the application
)

REM Start the application
echo 🔧 Building and starting application...
call yarn build & call yarn start:dev

echo ✅ VieGrand Backend is running!
echo 📖 API Documentation: http://localhost:3000/api-docs
echo 🔗 API Base URL: http://localhost:3000/api
pause
