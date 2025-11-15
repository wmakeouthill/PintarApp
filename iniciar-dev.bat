@echo off
echo ================================================
echo Iniciando Ambiente de Desenvolvimento
echo ================================================
echo.

set SDK_PATH=D:\Android\Sdk
set ADB=%SDK_PATH%\platform-tools\adb.exe
set EMULATOR=%SDK_PATH%\emulator\emulator.exe

:: Verificar se o emulador está rodando
"%ADB%" devices | findstr /C:"emulator" >nul

if errorlevel 1 (
    echo Emulador nao detectado. Iniciando emulador RedmiPad2...
    start "" "%EMULATOR%" -avd RedmiPad2 -no-snapshot-load
    echo Aguardando emulador inicializar...
    timeout /t 20 /nobreak >nul
    
    :: Verificar novamente
    "%ADB%" devices | findstr /C:"emulator" >nul
    if errorlevel 1 (
        echo ERRO: Emulador nao iniciou corretamente.
        pause
        exit /b 1
    )
)

echo Emulador detectado!
echo.

:: Configurar port forwarding
echo Configurando port forwarding para hot reload...
"%ADB%" reverse tcp:8081 tcp:8081
"%ADB%" reverse tcp:8097 tcp:8097

echo.
echo Iniciando Metro Bundler...
start "Metro Bundler - PintarApp" cmd /k "cd /d %~dp0 && npm start"

echo Aguardando Metro Bundler inicializar...
timeout /t 5 /nobreak >nul

echo.
echo Instalando e iniciando app...
call npm run android

if errorlevel 1 (
    echo.
    echo Tentando iniciar app manualmente...
    "%ADB%" shell am start -n com.pintarapp/com.pintarapp.MainActivity
)

echo.
echo ================================================
echo Ambiente de desenvolvimento iniciado!
echo ================================================
echo.
echo O app esta rodando no emulador tablet.
echo O Metro Bundler esta rodando em uma janela separada.
echo.
echo Para recarregar o app apos mudancas no codigo:
echo   - Pressione R duas vezes no terminal do Metro Bundler
echo   - Ou execute: reload-app.bat
echo   - Ou balance o dispositivo (Ctrl+M) e escolha "Reload"
echo.
pause

