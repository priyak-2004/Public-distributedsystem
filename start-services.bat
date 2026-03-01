@echo off
REM Start all required services for the PDS (Public Distribution System)
REM This batch file starts:
REM   1. AI Fraud Detection Service (Python / FastAPI) on port 5000
REM   2. Backend Node Service on port 4000
REM   3. Frontend React Service on port 3000

echo.
echo ========================================
echo  PDS - Public Distribution System
echo  Service Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Start AI Service
echo.
echo [1/3] Starting AI Fraud Detection Service on port 5000...
start "AI Service" cmd /k "cd ai-service && python main.py"
timeout /t 3 /nobreak

REM Start Backend
echo.
echo [2/3] Starting Backend Node Service on port 4000...
start "Backend Service" cmd /k "cd backend-node && npm start"
timeout /t 2 /nobreak

REM Start Frontend
echo.
echo [3/3] Starting Frontend React Service on port 3000...
start "Frontend Service" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  Services Starting...
echo ========================================
echo.
echo AI Service:      http://localhost:5000
echo Backend API:     http://localhost:4000
echo Frontend UI:     http://localhost:3000
echo.
echo Press any key in any service window to stop it.
echo ========================================
echo.
pause
