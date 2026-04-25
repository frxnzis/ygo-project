# YGO Project - Revision Tecnica

Fecha de revision: 2026-04-24

Repositorio origen: https://github.com/frxnzis/ygo-project

## Resumen

Se reviso una copia local del proyecto YGO Project, una app React/CRA que consume la API publica de YGOPRODeck para buscar cartas de Yu-Gi-Oh!.

El codigo fuente local coincidia casi por completo con `master` del repositorio origen. La diferencia critica estaba en dependencias: la copia local tenia versiones incorrectas en `package.json` y `package-lock.json`, especialmente `react-scripts@0.0.0`, lo que impedia compilar o correr pruebas.

Despues de corregir dependencias y algunos problemas de runtime, el proyecto queda ejecutando en desarrollo, compila correctamente y tiene una prueba basica actualizada.

## Hallazgos Iniciales

### 1. La carpeta local no era un repositorio Git

`git status` devolvia:

```text
fatal: not a git repository (or any of the parent directories): .git
```

Esto indicaba que la carpeta era probablemente una descarga ZIP o copia manual, no un clon del repo. Por eso no habia historial ni forma directa de comparar cambios locales contra el origen.

### 2. Diferencias contra el repositorio origen

Se consulto el repo remoto sin clonarlo. El arbol de archivos coincidia con el origen, pero `package.json` diferia:

```diff
- "next": "^12.1.3"
- "react-scripts": "5.0.0"
- "gh-pages": "^3.2.3"
+ "next": "^16.2.4"
+ "react-scripts": "^0.0.0"
+ "gh-pages": "^6.3.0"
```

La version `react-scripts@0.0.0` no proveia el binario esperado, por lo que fallaban:

```bash
npm run build
npm test
```

### 3. Dependencias antiguas con npm moderno

Al reinstalar dependencias, npm moderno resolvio algunas ramas transitivas de forma conflictiva:

- `ajv-keywords@5` esperaba `ajv@8`.
- El arbol tenia `ajv@6` en la raiz.
- Jest/Babel cargaba plugins nuevos con `@babel/core` antiguo.

Esto causaba errores como:

```text
Cannot find module 'ajv/dist/compile/codegen'
Requires Babel "^7.22.0 || ^8.0.0-0", but was loaded with "7.17.8"
```

### 4. Test heredado de Create React App

`src/App.test.js` buscaba el texto `learn react`, que no existe en la app real. Cuando Jest logro ejecutarse, la prueba fallaba por estar desactualizada.

### 5. Script `start` no portable en Windows

El script original usaba:

```json
"start": "PORT=8000 react-scripts start"
```

Esa sintaxis funciona en shells Unix, pero falla en Windows. Se cambio a:

```json
"start": "react-scripts start"
```

### 6. Manejo debil de la API

La llamada a YGOPRODeck concatenaba strings manualmente:

```js
fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=' + inputSearch + lang + '&misc=yes')
```

Problemas:

- No codificaba caracteres especiales o espacios de forma segura.
- Enviaba datos a la UI antes de comprobar `response.ok`.
- No habia estado `loading`.
- Se podian disparar varias busquedas simultaneas.

### 7. Busqueda automatica no deseada

Al agregar mejoras iniciales, se detecto que el `useEffect` de idioma podia disparar busquedas al escribir porque dependia indirectamente de funciones que cambiaban con `inputSearch`.

Se corrigio separando:

- texto escrito en el input;
- ultima busqueda enviada;
- busqueda manual por click o Enter;
- re-busqueda solo al cambiar idioma despues de haber buscado.

### 8. Error visual de ResizeObserver

Durante el render de resultados aparecia en desarrollo:

```text
ResizeObserver loop completed with undelivered notifications.
```

El origen probable era `Masonry` de MUI, que usa mediciones dinamicas de layout. CRA mostraba el error como overlay rojo.

## Cambios Aplicados

### Dependencias y arranque

Se corrigio `package.json` para recuperar el arranque:

- `react-scripts` quedo en `5.0.0`.
- `next` se fijo en `12.1.3` para evitar resoluciones inesperadas.
- `gh-pages` volvio a `^3.2.3`.
- Se agrego `ajv@8` como dependencia de desarrollo para compatibilidad con `ajv-keywords`.
- Se agrego `@babel/core` moderno para compatibilidad con los plugins Babel resueltos por npm actual.
- Se uso `npm install --legacy-peer-deps` porque el proyecto mezcla versiones antiguas de MUI/React/CRA.

### API YGOPRODeck

La API documentada indica:

- `name`: busqueda exacta.
- `fname`: busqueda difusa por caracteres en el nombre.
- `misc=yes`: agrega informacion adicional.
- `language`: acepta `fr`, `de`, `it`, `pt`.
- Rate limit: 20 requests por segundo; excederlo puede bloquear por 1 hora.
- Las imagenes no deberian hotlinkearse continuamente en produccion.

El proyecto usa correctamente `fname`, por lo que acepta busquedas parciales como `zombie`, `dragon` o `magician`.

Se reemplazo la construccion manual de URL por `URLSearchParams`:

```js
const params = new URLSearchParams({
  fname: searchValue,
  misc: 'yes'
});

if (language) {
  params.set('language', language);
}
```

Tambien se cambio el orden de manejo:

1. Hacer `fetch`.
2. Parsear JSON.
3. Validar `response.ok`.
4. Solo despues enviar datos validos a la UI.

### Busqueda con Enter

Se agrego soporte para buscar presionando Enter en el input, ademas del click en el icono.

### Loading y control de multiples requests

Se agrego estado `loading` en `App` y se paso a `Overview`.

Mientras la API responde, se muestra un spinner con:

```text
Searching cards...
```

Tambien se agrego un candado con `useRef` para evitar doble click o Enter repetido mientras una request esta en curso.

### Correccion del disparo automatico al escribir

Se agregaron refs:

- `lastSubmittedSearch`: guarda el ultimo termino buscado.
- `isFirstLanguageRender`: evita busqueda automatica en el primer render.
- `searchInProgress`: evita multiples requests simultaneas.

Resultado:

- escribir en el input no dispara busqueda;
- click o Enter si disparan busqueda;
- cambiar idioma re-busca solo el ultimo termino ya enviado.

### Reemplazo de Masonry

Se elimino `Masonry` de `@mui/lab` y se reemplazo por CSS Grid responsivo.

Motivo:

- reducir el riesgo de `ResizeObserver loop`;
- evitar overlay rojo en desarrollo;
- simplificar layout;
- reducir ligeramente el bundle.

### Rediseño base: Duel Terminal Pro

Se aplico una segunda pasada visual sobre la app React para acercarla al mockup `design-previews/duel-terminal-pro.html`.

Cambios principales:

- `App` dejo de usar contenedores `styled` de MUI para el layout base y ahora usa clases SCSS (`App`, `shell`).
- `public/index.html` ya no carga Bootstrap CSS/JS desde CDN; esto reduce dependencias visuales externas y evita conflictos con el nuevo sistema de estilos.
- `MainNavbar` se simplifico: conserva MUI solo para el dialogo de ayuda y mueve la barra principal a markup propio con `main-navbar.scss`.
- La busqueda ahora usa `AbortController`, cancela requests anteriores, mantiene solo la respuesta mas reciente y corta requests lentas despues de 15 segundos.
- La UI muestra errores de API en un panel visible (`status-panel-error`) en vez de convertir todos los fallos en "No cards found".
- `Overview` renderiza una grilla compacta de 12 cartas por pagina, paginacion propia y un modal de detalle mas visual con imagen grande, contador de variantes y stats estructurados.
- Los estilos globales en `App.scss` definen la paleta, fondo, paneles, grilla, tiles, estados de carga, estados vacios, modal y responsive mobile.
- Se agrego `src/components/main-navbar.scss` para aislar la navegacion, busqueda, selector de idioma y boton de ayuda.

### Mockups cargados como referencia

Se agrego la carpeta `design-previews/` con mockups HTML estaticos para guiar futuros redisenos:

- `design-previews/duel-terminal-pro.html`: referencia principal. Propone una interfaz oscura tipo terminal de duelo profesional, con fondo cuadriculado, paneles sobrios, acentos dorados/azules, topbar sticky, grilla de cartas y modal de detalle.
- `design-previews/cyber-duel-search.html`: referencia alternativa. Propone una direccion mas cyber/terminal, con verdes y cian, efecto scanline, una barra superior mas tecnica y una atmosfera mas experimental.

Estos archivos son referencias visuales, no forman parte del bundle React. Si se usan para futuros cambios, conviene portar solo patrones concretos y validar responsive, accesibilidad y estados de datos reales.

### Test actualizado

La prueba de CRA se reemplazo por una prueba de UI real:

```js
expect(screen.getByAltText(/yu-gi-oh! logo/i)).toBeInTheDocument();
expect(screen.getByPlaceholderText(/search cards/i)).toBeInTheDocument();
```

## Validacion Realizada

Se valido:

```bash
npm run build
```

Resultado: compila correctamente.

Tambien se valido que el servidor local responde:

```text
http://localhost:3000 -> 200
```

Jest llego a correr y la prueba corregida paso durante la revision. En algunos entornos sandbox fue necesario correrlo fuera del sandbox porque Jest usa procesos hijo.

## Warnings Pendientes

El build aun muestra warnings de ESLint por imports sin usar:

- `Typography`
- `FilterAltIcon`
- `DialogContentText`

Estos estan principalmente en `src/components/main-navbar.js`.

Ya se limpiaron varios imports sin usar de `src/pages/overview.js`.

Actualizacion: con el rediseño actual, varios imports antiguos de `main-navbar.js` ya fueron eliminados. Si reaparecen warnings de ESLint, revisar primero imports no usados al mover componentes entre MUI y markup propio.

## Riesgos o Conflictos Posibles

### 1. Dependencias antiguas

El proyecto depende de CRA 5, MUI 5 antiguo, React 18 inicial y Next instalado aunque no se usa en runtime. Esto puede generar conflictos al instalar con npm moderno.

Recomendacion:

- si no se usa Next, remover `next`;
- actualizar MUI y testing libraries en una tarea separada;
- mantener `package-lock.json` versionado y estable.

### 2. Vulnerabilidades npm

`npm install` reporto vulnerabilidades en dependencias antiguas. No se aplico `npm audit fix --force` porque podria introducir breaking changes.

Recomendacion:

- revisar `npm audit` en una rama aparte;
- evitar `--force` hasta probar bien la app.

### 3. Hotlinking de imagenes

La documentacion de YGOPRODeck advierte que no se deben hotlinkear imagenes de forma intensiva. El proyecto actualmente usa `image_url` e `image_url_small` directamente.

Para uso personal o demo puede estar bien. Para produccion, conviene:

- cachear imagenes;
- re-hospedarlas;
- o implementar una estrategia de carga limitada.

### 4. Rate limit de API

La API permite 20 requests por segundo. Actualmente se busca solo con Enter/click y se bloquean requests simultaneas, lo cual reduce el riesgo.

Si se agrega busqueda automatica mientras se escribe, debe incluir debounce.

### 5. Idiomas

Las imagenes solo estan en ingles segun la documentacion. Cambiar idioma afecta datos textuales disponibles, pero no las imagenes.

Ademas, algunas cartas nuevas o filtradas pueden no tener traduccion completa.

### 6. React 18 con APIs antiguas

El proyecto aun usa `ReactDOM.render` en `src/index.js`. React 18 recomienda `createRoot`.

No se cambio para evitar ampliar el alcance, pero deberia considerarse.

### 7. Cambios futuros de diseño base

El nuevo diseño depende mas de SCSS propio y menos de componentes MUI. Eso da mas control visual, pero tambien deja mas responsabilidad sobre responsive, accesibilidad y estados extremos.

Posibles errores al cambiar el diseño base o crear futuros diseños:

- la topbar sticky puede solaparse con contenido si cambian alturas, margenes o z-index;
- el buscador puede romperse en mobile si el input, selector de idioma y boton no mantienen tracks responsivos;
- textos largos o traducciones pueden salirse de tiles, botones, stats o modal;
- cartas sin campos opcionales (`race`, `attribute`, `def`, `scale`, `linkval`, `archetype`) pueden dejar huecos visuales o errores si se eliminan las validaciones condicionales;
- cartas con varias imagenes pueden perder el contador o el click para cambiar imagen;
- cartas sin imagen esperada pueden romper la grilla si no se agrega fallback;
- la paginacion propia puede deshabilitar mal los botones si cambia `rowsPerPage` o el calculo de `totalPages`;
- animaciones, hover scaling o sombras pueden causar layout shift si se aplican fuera de `transform`;
- aumentar la cantidad de cartas visibles por pagina puede afectar rendimiento y cargar demasiadas imagenes externas;
- volver a layouts basados en mediciones dinamicas puede reactivar errores `ResizeObserver`;
- cambiar la paleta puede bajar contraste en texto secundario, placeholders, botones deshabilitados y paneles de error;
- mezclar Bootstrap, MUI `sx` y SCSS global puede causar especificidad dificil de depurar;
- los mockups usan estilos estaticos y datos simulados, por lo que no garantizan comportamiento correcto con respuestas reales de la API.

Recomendacion para futuros redisenos:

1. Probar primero con datos reales de la API.
2. Revisar mobile antes de tocar desktop fino.
3. Mantener estados visibles para loading, error, sin resultados y request lenta.
4. Evitar dependencias visuales globales por CDN si no son estrictamente necesarias.
5. Validar build y test despues de cada cambio visual grande.

## Mejoras Recomendadas

1. Remover dependencias no usadas, especialmente `next` si no hay migracion a Next.js.
2. Migrar `ReactDOM.render` a `createRoot`.
3. Limpiar imports muertos para dejar build sin warnings.
4. Agregar estados de error visibles en UI, no solo `No cards found`.
5. Agregar debounce si se desea busqueda automatica.
6. Mejorar accesibilidad:
   - labels mas especificos para botones;
   - `aria-label` distinto para buscar e idioma.
7. Separar cliente API en un archivo dedicado, por ejemplo `src/services/ygoprodeck-api.js`.
8. Agregar tests para:
   - busqueda por Enter;
   - click en icono;
   - loading;
   - respuesta vacia;
   - error de API.
9. Revisar cache/local storage para consultas recientes.
10. Considerar estrategia de imagenes si el proyecto se publica con trafico real.

## Estado Final

El proyecto queda:

- arrancando en desarrollo;
- compilando con `npm run build`;
- usando busqueda segura con `URLSearchParams`;
- soportando Enter y click;
- mostrando loading;
- evitando multiples requests simultaneas;
- sin `Masonry`, reduciendo el problema de `ResizeObserver`;
- con test basico actualizado.

---

# YGO Project - Technical Review

Review date: 2026-04-24

Source repository: https://github.com/frxnzis/ygo-project

## Summary

This review covered a local copy of YGO Project, a React/CRA app that consumes the public YGOPRODeck API to search Yu-Gi-Oh! cards.

The local source code mostly matched the upstream `master` branch. The critical difference was in dependency versions: the local copy had incorrect versions in `package.json` and `package-lock.json`, especially `react-scripts@0.0.0`, which prevented the app from building or running tests.

After dependency fixes and a few runtime improvements, the project now runs locally, builds successfully, and has an updated basic test.

## Initial Findings

### 1. The local folder was not a Git repository

`git status` returned:

```text
fatal: not a git repository (or any of the parent directories): .git
```

This means the folder was likely downloaded as a ZIP or copied manually, rather than cloned from GitHub. Because of that, there was no Git history or direct way to compare local changes against upstream.

### 2. Differences from the upstream repository

The upstream file tree was checked without cloning the repository. The source files matched, but `package.json` differed:

```diff
- "next": "^12.1.3"
- "react-scripts": "5.0.0"
- "gh-pages": "^3.2.3"
+ "next": "^16.2.4"
+ "react-scripts": "^0.0.0"
+ "gh-pages": "^6.3.0"
```

`react-scripts@0.0.0` did not provide the expected executable, so these commands failed:

```bash
npm run build
npm test
```

### 3. Older dependencies with modern npm

After reinstalling dependencies, modern npm resolved some transitive packages in a conflicting way:

- `ajv-keywords@5` expected `ajv@8`.
- The root dependency tree had `ajv@6`.
- Jest/Babel loaded newer Babel plugins while using an older `@babel/core`.

This caused errors such as:

```text
Cannot find module 'ajv/dist/compile/codegen'
Requires Babel "^7.22.0 || ^8.0.0-0", but was loaded with "7.17.8"
```

### 4. Stale Create React App test

`src/App.test.js` still looked for the default CRA text `learn react`, which is no longer rendered by the app. Once Jest was able to run, this test failed because it was outdated.

### 5. Non-portable `start` script on Windows

The original script used:

```json
"start": "PORT=8000 react-scripts start"
```

This works in Unix shells, but not on Windows. It was changed to:

```json
"start": "react-scripts start"
```

### 6. Weak API request handling

The YGOPRODeck API request was manually concatenated:

```js
fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=' + inputSearch + lang + '&misc=yes')
```

Problems:

- Search input was not safely encoded.
- Data was sent to the UI before checking `response.ok`.
- There was no loading state.
- Multiple searches could be triggered at the same time.

### 7. Unwanted automatic search while typing

During initial improvements, a `useEffect` dependency chain caused searches to trigger while typing. This happened because callback functions changed whenever `inputSearch` changed.

This was fixed by separating:

- typed input value;
- last submitted search value;
- manual search by click or Enter;
- language-triggered re-search only after a previous search was submitted.

### 8. ResizeObserver runtime overlay

When results rendered, the CRA development overlay showed:

```text
ResizeObserver loop completed with undelivered notifications.
```

The likely source was MUI Lab `Masonry`, which uses dynamic layout measurement. CRA displayed this as a red runtime error overlay.

## Applied Changes

### Dependencies and startup

The dependency setup was corrected:

- `react-scripts` was restored to `5.0.0`.
- `next` was pinned to `12.1.3` to avoid unexpected resolution changes.
- `gh-pages` was restored to `^3.2.3`.
- `ajv@8` was added as a development dependency for compatibility with `ajv-keywords`.
- A newer `@babel/core` was added for compatibility with resolved Babel plugins.
- `npm install --legacy-peer-deps` was used because the project combines older CRA/MUI/React dependency versions.

### YGOPRODeck API

According to the official API documentation:

- `name` performs an exact name lookup.
- `fname` performs a fuzzy name search.
- `misc=yes` includes additional metadata.
- `language` accepts `fr`, `de`, `it`, and `pt`.
- Rate limit is 20 requests per second; exceeding it may block the client for 1 hour.
- Card images should not be hotlinked heavily in production.

The project correctly uses `fname`, so partial searches such as `zombie`, `dragon`, or `magician` are supported.

Manual URL concatenation was replaced with `URLSearchParams`:

```js
const params = new URLSearchParams({
  fname: searchValue,
  misc: 'yes'
});

if (language) {
  params.set('language', language);
}
```

The request flow was also changed:

1. Run `fetch`.
2. Parse JSON.
3. Validate `response.ok`.
4. Only then send valid data to the UI.

### Enter key search

The input now supports searching with Enter, in addition to clicking the search icon.

### Loading state and duplicate request prevention

A `loading` state was added in `App` and passed down to `Overview`.

While waiting for the API response, the UI shows:

```text
Searching cards...
```

A `useRef` lock was also added to prevent double click or repeated Enter from sending multiple simultaneous requests.

### Fix for automatic search while typing

The search state was split using refs:

- `lastSubmittedSearch`: stores the last submitted search term.
- `isFirstLanguageRender`: prevents an automatic search on first render.
- `searchInProgress`: prevents simultaneous API requests.

Result:

- typing in the input does not trigger a search;
- clicking the icon or pressing Enter does trigger a search;
- changing language re-runs the last submitted search only.

### Masonry replacement

MUI Lab `Masonry` was removed and replaced with a responsive CSS Grid layout.

Reason:

- reduce the risk of `ResizeObserver loop` errors;
- avoid the CRA red development overlay;
- simplify layout behavior;
- slightly reduce bundle size.

### Updated test

The stale CRA test was replaced with a test for the real UI:

```js
expect(screen.getByAltText(/yu-gi-oh! logo/i)).toBeInTheDocument();
expect(screen.getByPlaceholderText(/search cards/i)).toBeInTheDocument();
```

## Validation

Validated with:

```bash
npm run build
```

Result: successful build.

The local development server also responded successfully:

```text
http://localhost:3000 -> 200
```

Jest was able to run and the updated test passed during the review. In some sandboxed environments it had to be run outside the sandbox because Jest spawns child processes.

## Remaining Warnings

The build still reports ESLint warnings for unused imports:

- `Typography`
- `FilterAltIcon`
- `DialogContentText`

These are mainly in `src/components/main-navbar.js`.

Several unused imports were already cleaned up from `src/pages/overview.js`.

## Risks and Possible Conflicts

### 1. Older dependencies

The project depends on CRA 5, older MUI 5 packages, early React 18 versions, and includes Next.js even though it is not used at runtime. This can create install conflicts with modern npm.

Recommendation:

- remove `next` if there is no active Next.js migration;
- update MUI and testing libraries in a separate task;
- keep `package-lock.json` committed and stable.

### 2. npm vulnerabilities

`npm install` reported vulnerabilities in older dependencies. `npm audit fix --force` was not applied because it may introduce breaking changes.

Recommendation:

- review `npm audit` in a separate branch;
- avoid `--force` until the app is fully tested.

### 3. Image hotlinking

YGOPRODeck documentation warns against heavy direct image hotlinking. The project currently uses `image_url` and `image_url_small` directly.

This may be acceptable for personal/demo usage. For production, consider:

- caching images;
- re-hosting images;
- limiting image loading volume.

### 4. API rate limit

The API allows 20 requests per second. Searches are currently manual and simultaneous requests are blocked, reducing the risk.

If automatic search while typing is added later, debounce should be required.

### 5. Languages

According to the documentation, card images are only stored in English. Language selection affects textual data, not images.

Some new or less common cards may not have complete translations.

### 6. React 18 legacy API

The project still uses `ReactDOM.render` in `src/index.js`. React 18 recommends `createRoot`.

This was not changed to keep the scope small, but should be considered in a future cleanup.

## Recommended Improvements

1. Remove unused dependencies, especially `next` if there is no Next.js migration.
2. Migrate `ReactDOM.render` to `createRoot`.
3. Clean unused imports to remove build warnings.
4. Add visible UI error states instead of only showing `No cards found`.
5. Add debounce if automatic search is introduced.
6. Improve accessibility:
   - use more specific labels for buttons;
   - avoid using the same `aria-label` for search and language buttons.
7. Move the API client into a dedicated file, for example `src/services/ygoprodeck-api.js`.
8. Add tests for:
   - Enter search;
   - search icon click;
   - loading state;
   - empty API response;
   - API error response.
9. Consider local cache/storage for recent queries.
10. Consider an image strategy if the app is published with real traffic.

## Final State

The project now:

- starts in development;
- builds with `npm run build`;
- uses safer API requests through `URLSearchParams`;
- supports Enter and click search;
- displays a loading state;
- prevents simultaneous duplicate requests;
- no longer uses `Masonry`, reducing the `ResizeObserver` issue;
- has an updated basic UI test.
