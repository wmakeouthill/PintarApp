# PintarApp

Aplicativo de pintura em SVG pensado para funcionar 100% offline no Android (e pronto para evoluir com anúncios e versão premium). O foco é manter uma base limpa desde o início: camadas bem separadas, tipagem forte e componentes desacoplados.

## Stack

- React Native 0.76 + TypeScript
- `react-native-svg` e `react-native-svg-transformer` para carregar vetores
- Safe Area Context, hooks e reducers para gerenciar estado imutável
- Alias `@/*` configurado em Babel/TS para manter imports curtos

## Pré-requisitos

- Node 18+
- Ambiente Android configurado (Android Studio + SDKs) conforme [guia oficial](https://reactnative.dev/docs/environment-setup)

## Instalação e execução

```bash
npm install

# abre o Metro bundler
npm start

# em outro terminal, instala/roda no dispositivo ou emulador
npm run android

# opcional: rodar no iOS (macOS)
npm run ios
```

Utilize `npm run lint`, `npm run test` e `npm run typecheck` para garantir qualidade contínua.

## Estrutura

```
src/
  app/            # Composition root (App, providers)
  core/           # Design system e utilidades genéricas
  features/
    coloring/     # Domínio de pintura (componentes, hooks, estado)
  types/          # Declarações globais (e.g. SVG)
assets/svgs/      # Vetores locais incorporados ao APK
```

Cada feature mantém dados, modelos, hooks, componentes e reducers próprios para favorecer coesão e testabilidade.

## Funcionalidades atuais

- Tela única `ColoringScreen` com cabeçalho, tela de pintura e toolbox
- `SvgColoringSurface` aplica cores via `Path.onPress`, simulando ferramenta de preenchimento/borracha
- `ColorPalette` com lista horizontal de swatches; `Toolbox` alterna entre preencher e apagar, além de resetar o desenho
- Estado isolado no hook `useColoringSession`, baseado em reducer puro (`coloringReducer`)

## Próximos passos sugeridos

- Persistir sessões localmente (AsyncStorage/SQLite)
- Importar SVGs externos e construir biblioteca de páginas
- Adicionar zoom/pan e ferramentas extras (bucket, brush, eyedropper)
- Integrar anúncios (AdMob) e versão premium sem ads

Com essa base já é possível gerar um APK offline e evoluir gradualmente mantendo Clean Code e separação de responsabilidades.
