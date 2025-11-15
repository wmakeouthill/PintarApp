# Instruções para Configurar e Usar o Emulador Tablet Android

Este guia explica como configurar o emulador Android para testar o app em proporção de tablet (Redmi Pad 2).

## Arquivos Criados

1. **`criar-emulador-tablet.bat`** - Cria o emulador tablet automaticamente
2. **`iniciar-emulador-tablet.bat`** - Inicia o emulador tablet
3. **`iniciar-app.bat`** - Inicia o Metro Bundler e executa o app no emulador
4. **`setup-completo.bat`** - Faz tudo automaticamente (criar + iniciar emulador + iniciar app)

## Opção 1: Setup Automático Completo (Recomendado)

Execute no terminal dentro da pasta `PintarApp`:

```batch
setup-completo.bat
```

Este script vai:
1. Criar/configurar o emulador tablet (RedmiPad2)
2. Iniciar o emulador
3. Iniciar o aplicativo

## Opção 2: Passo a Passo Manual

### Passo 1: Criar o Emulador Tablet

```batch
criar-emulador-tablet.bat
```

Este script vai:
- Instalar a imagem do sistema Android 35 Google APIs Tablet (se necessário)
- Criar um AVD chamado "RedmiPad2" com perfil de tablet

**Nota:** A instalação da imagem do sistema pode levar alguns minutos na primeira vez.

### Passo 2: Iniciar o Emulador

```batch
iniciar-emulador-tablet.bat
```

Ou manualmente:
```batch
D:\Android\Sdk\emulator\emulator.exe -avd RedmiPad2
```

**Aguarde o emulador inicializar completamente** (pode levar 30-60 segundos).

### Passo 3: Iniciar o App

```batch
iniciar-app.bat
```

Ou manualmente:
```batch
npm start
```
(Em outro terminal)
```batch
npm run android
```

## Especificações do Emulador

- **Nome:** RedmiPad2
- **Perfil:** Pixel Tablet (pixel_c)
- **Sistema:** Android 35 Google APIs Tablet
- **Resolução:** 2560 x 1600 (WQXGA)
- **Tela:** 11 polegadas
- **Densidade:** ~274 PPI (xxhdpi)

## Solução de Problemas

### Erro: "AVD não encontrado"
Execute `criar-emulador-tablet.bat` primeiro para criar o emulador.

### Erro: "Imagem do sistema não encontrada"
O script tentará instalar automaticamente. Se falhar, instale manualmente:
```batch
D:\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat "system-images;android-35;google_apis_tablet;x86_64"
```

### Erro: "Nenhum emulador detectado"
Certifique-se de que o emulador está totalmente inicializado antes de executar o app.

### O app ainda abre em modo celular
Verifique se o `AndroidManifest.xml` está configurado corretamente. As configurações já foram aplicadas, mas pode ser necessário limpar e reconstruir:
```batch
cd android
gradlew clean
cd ..
npm run android
```

## Comandos Úteis

### Listar AVDs disponíveis:
```batch
D:\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat list avd
```

### Listar dispositivos conectados:
```batch
adb devices
```

### Deletar um AVD:
```batch
D:\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat delete avd -n RedmiPad2
```

## Configurações Aplicadas no Código

O `AndroidManifest.xml` foi configurado para:
- Suportar apenas telas grandes (tablets)
- Exigir largura mínima de 600dp (força modo tablet)
- Permitir orientação flexível

Essas configurações garantem que o app seja reconhecido como tablet e abra corretamente em proporção de tablet.

