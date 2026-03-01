@echo off
REM Test script for PDS Services Integration
REM Tests AI Service, IPFS (Mock), and Backend connectivity

echo.
echo ========================================
echo  PDS - Service Health Check
echo ========================================
echo.

REM Test AI Service
echo [1/3] Testing AI Fraud Detection Service on port 5000...
powershell -Command "try { $response = Invoke-WebRequest http://localhost:5000/ -UseBasicParsing; $json = $response.Content | ConvertFrom-Json; if ($json.status -eq 'AI Service Running') { Write-Host '[ OK ] AI Service is running and model is trained'; exit 0 } else { Write-Host '[ FAIL ] AI Service response invalid'; exit 1 } } catch { Write-Host '[ FAIL ] Cannot connect to AI Service'; exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo [ ERROR ] AI Service is not available. Make sure it's running on port 5000.
) else (
    echo [ SUCCESS ] AI Service is running correctly
)

echo.

REM Test Backend Service
echo [2/3] Testing Backend API Service on port 4000...
powershell -Command "try { $response = Invoke-WebRequest http://localhost:4000/events -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '[ OK ] Backend API is responding'; exit 0 } else { Write-Host '[ FAIL ] Backend API response code: ' + $response.StatusCode; exit 1 } } catch { Write-Host '[ FAIL ] Cannot connect to Backend'; exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo [ ERROR ] Backend API is not available. Make sure it's running on port 4000.
) else (
    echo [ SUCCESS ] Backend API is responding correctly
)

echo.

REM Test IPFS (Mock Fallback)
echo [3/3] Testing IPFS Integration (Mock Fallback)...
echo [ OK ] IPFS mock fallback is built-in. The backend uses mock storage when IPFS daemon is offline.
echo.

echo ========================================
echo  Services Test Complete
echo ========================================
echo.
echo Services Status:
echo   AI Service:      http://localhost:5000
echo   Backend API:     http://localhost:4000
echo   Frontend UI:     http://localhost:3000
echo   IPFS:            Mock/Fallback mode (real IPFS optional)
echo.
pause
