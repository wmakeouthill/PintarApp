@echo off
echo ================================================
echo Criando Emulador Android Tablet - Redmi Pad 2
echo ================================================
echo.

set SDK_PATH=D:\Android\Sdk
set AVDMANAGER=%SDK_PATH%\cmdline-tools\latest\bin\avdmanager.bat
set SDKMANAGER=%SDK_PATH%\cmdline-tools\latest\bin\sdkmanager.bat
set EMULATOR=%SDK_PATH%\emulator\emulator.exe

:: Verificar se o SDK existe
if not exist "%SDK_PATH%" (
    echo ERRO: SDK Android nao encontrado em %SDK_PATH%
    echo Por favor, ajuste o caminho no script ou instale o Android SDK
    pause
    exit /b 1
)

echo 1. Verificando se a imagem do sistema tablet ja esta instalada...
echo.

"%SDKMANAGER%" --list_installed | findstr /i "google_apis_tablet" >nul

if errorlevel 1 (
    echo Imagem do sistema tablet nao encontrada.
    echo Instalando imagem do sistema Android 35 Google APIs Tablet...
    echo.
    "%SDKMANAGER%" "system-images;android-35;google_apis_tablet;x86_64"
    
    if errorlevel 1 (
        echo.
        echo ERRO ao instalar imagem do sistema.
        echo Tentando com Google Play Tablet...
        "%SDKMANAGER%" "system-images;android-35;google_apis_playstore_tablet;x86_64"
    )
) else (
    echo Imagem do sistema tablet ja esta instalada!
    echo.
)

echo.
echo 2. Verificando AVDs existentes...
"%AVDMANAGER%" list avd
echo.

echo 3. Criando AVD RedmiPad2...
echo.

:: Deletar AVD existente se houver
"%AVDMANAGER%" delete avd -n RedmiPad2 2>nul

:: Criar novo AVD
echo Criando AVD com as seguintes especificacoes:
echo   - Nome: RedmiPad2
echo   - Sistema: Android 35 Google APIs Tablet
echo   - Perfil: pixel_c (tablet)
echo   - SD Card: 512 MB
echo.

"%AVDMANAGER%" create avd ^
    -n RedmiPad2 ^
    -k "system-images;android-35;google_apis_tablet;x86_64" ^
    -d "pixel_c" ^
    -c 512M

if errorlevel 1 (
    echo.
    echo Tentando criar com imagem alternativa (Google Play Tablet)...
    "%AVDMANAGER%" create avd ^
        -n RedmiPad2 ^
        -k "system-images;android-35;google_apis_playstore_tablet;x86_64" ^
        -d "pixel_c" ^
        -c 512M
)

if errorlevel 1 (
    echo.
    echo ================================================
    echo ERRO: Nao foi possivel criar o AVD automaticamente.
    echo ================================================
    echo.
    echo Por favor, crie manualmente no Android Studio:
    echo   1. Abra o Android Studio
    echo   2. Va em Tools -^> Device Manager
    echo   3. Clique em Create Device
    echo   4. Selecione categoria "Tablet"
    echo   5. Escolha "Pixel Tablet" ou crie customizado:
    echo      - Name: RedmiPad2
    echo      - Screen Size: 11"
    echo      - Resolution: 2560 x 1600
    echo      - Density: xxhdpi (274 PPI)
    echo   6. Selecione: Android 35 Google APIs Tablet
    echo   7. Configure SD Card: 512 MB
    echo   8. Finish
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo AVD RedmiPad2 criado com sucesso!
echo ================================================
echo.
echo Para iniciar o emulador, execute:
echo   iniciar-emulador-tablet.bat
echo.
echo Ou manualmente:
echo   "%EMULATOR%" -avd RedmiPad2
echo.
pause

