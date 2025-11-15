@echo off
echo ================================================
echo Iniciando PintarApp no Emulador Android
echo ================================================
echo.

:: Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo Por favor, execute este script dentro da pasta PintarApp
    pause
    exit /b 1
)

:: Verificar se o node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

:: Verificar se há um emulador rodando
echo Verificando se ha um emulador Android rodando...
adb devices | findstr /C:"emulator" >nul

if errorlevel 1 (
    echo.
    echo AVISO: Nenhum emulador detectado rodando!
    echo Inicie o emulador primeiro com:
    echo   iniciar-emulador-tablet.bat
    echo.
    echo Aguardando 5 segundos... (pressione Ctrl+C para cancelar)
    timeout /t 5 /nobreak >nul
    
    adb devices | findstr /C:"emulator" >nul
    if errorlevel 1 (
        echo.
        echo ERRO: Ainda nenhum emulador detectado.
        echo Por favor, inicie o emulador e tente novamente.
        pause
        exit /b 1
    )
)

echo Emulador detectado!
echo.

:: Iniciar Metro Bundler em uma nova janela
echo Iniciando Metro Bundler em background...
start "Metro Bundler - PintarApp" cmd /k "npm start"

echo Aguardando Metro Bundler inicializar...
timeout /t 3 /nobreak >nul

echo.
echo Iniciando aplicativo no emulador Android...
echo.

call npm run android

if errorlevel 1 (
    echo.
    echo ERRO ao iniciar o aplicativo.
    echo Verifique se:
    echo   1. O emulador esta totalmente inicializado
    echo   2. O Metro Bundler esta rodando
    echo   3. As dependencias estao instaladas (npm install)
    echo.
) else (
    echo.
    echo ================================================
    echo Aplicativo iniciado com sucesso!
    echo ================================================
    echo.
    echo O Metro Bundler esta rodando em uma janela separada.
    echo Para parar, feche a janela do Metro Bundler.
    echo.
)

pause

