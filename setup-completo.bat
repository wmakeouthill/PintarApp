@echo off
echo ================================================
echo Setup Completo - Emulador Tablet e App
echo ================================================
echo.

echo Este script vai:
echo   1. Criar/configurar o emulador tablet (RedmiPad2)
echo   2. Iniciar o emulador
echo   3. Iniciar o aplicativo React Native
echo.
pause

echo.
echo Passo 1: Criando emulador tablet...
call criar-emulador-tablet.bat

if errorlevel 1 (
    echo ERRO ao criar emulador. Saindo...
    pause
    exit /b 1
)

echo.
echo Passo 2: Iniciando emulador...
call iniciar-emulador-tablet.bat

echo.
echo Aguardando 15 segundos para o emulador inicializar completamente...
timeout /t 15 /nobreak >nul

echo.
echo Passo 3: Iniciando aplicativo...
call iniciar-app.bat

echo.
echo Setup completo! O app deve estar rodando no emulador tablet.
pause

