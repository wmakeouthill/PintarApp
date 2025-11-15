@echo off
echo ================================================
echo Iniciando Emulador Android Tablet - Redmi Pad 2
echo ================================================
echo.

set SDK_PATH=D:\Android\Sdk
set EMULATOR=%SDK_PATH%\emulator\emulator.exe
set AVD_NAME=RedmiPad2

:: Verificar se o emulador existe
if not exist "%EMULATOR%" (
    echo ERRO: Emulador nao encontrado em %EMULATOR%
    echo Por favor, verifique se o Android SDK esta instalado corretamente
    pause
    exit /b 1
)

echo Verificando se o AVD existe...
"%SDK_PATH%\cmdline-tools\latest\bin\avdmanager.bat" list avd | findstr /C:"%AVD_NAME%" >nul

if errorlevel 1 (
    echo.
    echo ERRO: AVD "%AVD_NAME%" nao encontrado!
    echo.
    echo Por favor, execute primeiro:
    echo   criar-emulador-tablet.bat
    echo.
    pause
    exit /b 1
)

echo AVD encontrado!
echo.
echo Iniciando emulador %AVD_NAME%...
echo O emulador esta iniciando. Aguarde alguns segundos...
echo.

:: Iniciar o emulador
start "" "%EMULATOR%" -avd %AVD_NAME% -no-snapshot-load

echo.
echo Emulador iniciado! Aguarde alguns segundos para ele inicializar completamente.
echo Quando estiver pronto, voce pode executar o app com:
echo   iniciar-app.bat
echo.
echo Ou manualmente:
echo   npm run android
echo.

