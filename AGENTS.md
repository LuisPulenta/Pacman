# AGENTS.md

## Proyecto

Clon de Pac-Man en Vanilla JS puro. Sin build system, sin framework, sin tests, sin dependencias.

- Ejecutar: abrir `src/index.html` en el navegador (o servir `src/` con un static server). No hay `npm` ni dev server.
- Único dev-test: consola del navegador. No hay lint/typecheck/test que correr.

## Arquitectura y convenciones

Los 4 scripts se cargan en orden en `src/index.html:19-22` y se comunican con globals expuestos en `window.*`:
`maze.js` → define `MAZE` y constantes → `game.js` (define `createGame/update/DIRS`) → `render.js` (define `draw`) → `main.js` (bucle, teclado, overlays).

- Al añadir un archivo: agregarlo a `index.html` en la posición correcta y exponer lo compartido con `window.*`. No existe módulos ES ni bundler.
- `MAZE` (`maze.js:50`) es inmutable por convención: nunca mutarlo. `createGame()` copia por filas a `game.grid`, que es lo que se dibuja muta (dots comidos) para permitir reiniciar.
- Coding grid legend (`maze.js:2`): `#`=1 pared, `.`=2 dot, `-`=3 puerta pen, espacio=0 vacío. Coordenadas en celdas (x,y), origen arriba-izquierda, grid 28×31, tunel en fila 14 (`TUNNEL_ROW`).
- La puerta (3) bloquea solo a Pacman; los fantasmas pasan (`game.js:56-63`).
- Estilo JS: `const`/`let`, llaves y paréntesis con espacios internos (`( x )`, `&&`), comentarios y strings de UI en español. Mantener el estilo del código existente y los comentarios en español.

## Workflow spec-driven

El proyecto usa spec-driven development (ver README). Espectativas instaladas en `.agents/skills/` (`spec` y `spec-impl`).

- Los specs viven en `specs/NN-slug.md` (aún no existe la carpeta), escritos en español, con estado `Draft` → (aprobado por el humano) `Approved` → `Implemented`.
- `specs/.spec-config.yml` controla creación automática de branch (`AutoCreateBranch: true` por defecto).
- `/spec-impl` crea/usa branch `spec-NN-slug` e implementa paso a paso, pausando para revisar el diff. Nunca se commitea sin orden explícita del usuario.