@echo off
echo ================================================
echo Recarregando App no Emulador
echo ================================================
echo.

set SDK_PATH=D:\Android\Sdk
set ADB=%SDK_PATH%\platform-tools\adb.exe

echo Recarregando app PintarApp...
"%ADB%" shell am force-stop com.pintarapp
timeout /t 1 /nobreak >nul
"%ADB%" shell am start -n com.pintarapp/com.pintarapp.MainActivity

echo.
echo App recarregado! As mudancas devem aparecer em alguns segundos.
echo.
echo Para recarregar manualmente no emulador:
echo   - Balancar o dispositivo (Ctrl+M ou Menu) e escolher "Reload"
echo   - Ou pressionar R duas vezes no terminal do Metro Bundler
echo.

