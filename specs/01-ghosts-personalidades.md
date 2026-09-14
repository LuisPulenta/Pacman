# SPEC 01 — 4 fantasmas con personalidades independientes

> **Status:** Approved
> **Date:** 2026-09-13
> **Objective:** Añadir 4 fantasmas al Pac-Man con personalidades independientes — agresor, patrullero, emboscador y errático — cada uno con reglas de movimiento propias, y el agresor persiguiendo a Pacman directamente.

## Scope

**In:**

- Cuatro fantasmas simultáneos, definidos en `GHOST_STARTS`, cada uno con una personalidad: `hunter` (agresor), `patroller` (patrullero), `ambusher` (emboscador) y `random` (errático).
- El agresor persigue la celda de Pacman con distancia Manhattan (existente en `game.js:123`).
- El patrullero recorre en ping-pong el corredor abierto de la fila 5 entre `(1,5)` y `(26,5)`.
- El emboscador apunta a la posición de Pacman + 4 celdas en su dirección actual (regla Pinky), clampado al tablero.
- Salida escalonada de la pen: los fantasmas se liberan uno cada segundo (~60 frames), el agresor primero. La puerta (3) ya les deja pasar (`game.js:56-63`).
- Mientras no se ha liberado un fantasma, permanece inmóvil en su celda; una vez liberado, mientras siga dentro de la pen (y∈[13,15], x∈[11,16]) se dirige hacia arriba para salir por la puerta, y solo entonces aplica su personalidad.
- Mantener la velocidad `GHOST_SPEED` común para todos.

**Out of scope (para futuros specs):**

- Estados comestibles/asustados (power-ups, fantasmas azules).
- Sinergia de grupo estilo Inky/Blinky o patrones de dispersión por zonas ("hogar").
- Velocidades variables, escalado por nivel o dificultad.
- Nuevos sprites, animaciones o sonidos.
- Refactor a un archivo separado (`ghost-ai.js`) — aquí se queda en `game.js`.

## Data model

```js
// maze.js — GHOST_STARTS pasa de 2 a 4. El orden fija el color por índice
// (render.js:147): 0 rojo, 1 cian, 2 rosa, 3 naranja.
const GHOST_STARTS = [
  { x: 13, y: 14, kind: "hunter" }, // agresor  → rojo
  { x: 13, y: 13, kind: "patroller" }, // patrullero → cian
  { x: 14, y: 14, kind: "ambusher" }, // emboscador → rosa
  { x: 13, y: 15, kind: "random" }, // errático → naranja
];

// game.js — ruta del patrullero, temporizador de salida y estado por fantasma.
const PATROL_POINTS = [
  { x: 1, y: 5 },
  { x: 26, y: 5 },
];
const RELEASE_DELAY = 60; // frames entre salidas (~1 s a 60 fps)

// game: { ..., ghostTimer }  acumula frames desde que empieza 'playing'
// ghost: { x, y, dir, speed, kind, patrolTarget, releaseAt, released }
//   patrolTarget: 0|1 — índice del extremo al que va el patrullero.
//   releaseAt: frame de liberación = índice * RELEASE_DELAY (0 el agresor).
//   released: false → inmóvil en la pen; dentro de la pen sube por la puerta.
```

- Las 4 celdas de inicio son distintas y transitables dentro de la pen (`maze.js:13,15` interior x 11-16).
- `createGame()` inicializa `patrolTarget: 0` solo en el `patroller`, y `releaseAt = índice * RELEASE_DELAY` / `released: false` en todos.
- `resetPositions()` restaura posición, `dir`, `patrolTarget`, `released` y pone `ghostTimer` a 0.

## Implementation plan

1. **`maze.js`:** ampliar `GHOST_STARTS` a 4 con los kinds y posiciones de arriba. El juego sigue funcionando: los kinds nuevos caen temporalmente en la rama aleatoria de `decideGhost`, y el render ya dibuja 4 colores. Verificación: cargar la página, se ven 4 fantasmas en la pen.
2. **`game.js`:** añadir `PATROL_POINTS`, el campo `patrolTarget` en `createGame` y `resetPositions`, y la rama `patroller` en `decideGhost` (objetivo = extremo actual; al alcanzar un extremo, alterna al otro, eligiendo en cada cruce la dirección que minimice Manhattan a ese extremo). El patrullero ya oscila entre `(1,5)` y `(26,5)`.
3. **`game.js`:** extraer la búsqueda "min Manhattan" de la rama `hunter` a un helper `aimDir( g, tx, ty, choices )` y añadir la rama `ambusher` (objetivo = `round(p.x) + 4·DIRS[p.dir].x`, `round(p.y) + 4·DIRS[p.dir].y`, clampado a `[0, W-1]×[0, H-1]`). El emboscador ya corta el paso.
4. **`game.js`:** salida escalonada. Añadir `RELEASE_DELAY`, `game.ghostTimer` acumulado en `update` mientras se juega, y en `moveGhost`: si `!released` y aún no toca su `releaseAt`, queda inmóvil; al liberarse, mientras siga dentro de la pen avanza hacia arriba (dir `up`) sin aplicar personalidad; fuera de la pen actúa normal. `resetPositions` reinicia `ghostTimer` y `released`.
5. **Revisión en navegador** (plan final): confirmar las 4 conductas, la liberación escalonada y que reiniciar partida vuelve a colocar los 4 en la pen con el temporizador a cero.

## Acceptance criteria

- [ ] Cargar `src/index.html` no produce errores en consola y muestra 4 fantasmas de colores rojo, cian, rosa y naranja.
- [ ] Al empezar, el agresor (rojo) sale de la pen de inmediato; cian, rosa y naranja salen uno a uno a ~1 s de diferencia, quedándose inmóviles hasta su turno.
- [ ] El agresor (rojo) reduce en cada cruce su distancia Manhattan a la celda de Pacman; no la aumenta salvo callejón sin salida (giro 180°).
- [ ] El patrullero (cian) alterna su objetivo entre `(1,5)` y `(26,5)`: alcanzado un extremo, se dirige al otro y nunca elige una dirección contraria a ese objetivo.
- [ ] El emboscador (rosa) usa como objetivo Pacman + 4 celdas en su dirección actual, sin salirse del tablero (clamp en el túnel).
- [ ] El errático (naranja) elige dirección aleatoria entre las válidas distintas de la reversa; usa la reversa solo en callejón sin salida.
- [ ] Un fantasma liberado dentro de la pen sale por la puerta siempre hacia arriba, sin aplicar personalidad hasta salir.
- [ ] Al reiniciar tras ganar o perder, los 4 fantasmas reaparecen en sus celdas del pen sin duplicarse ni solaparse con Pacman, y el temporizador de salida vuelve a 0.
- [ ] No cambian paredes, dots, puerta, túnel, score ni vidas respecto del estado actual.

## Decisions

- **Yes:** 4 personalidades independientes, sin sinergia de grupo. Menos código y verificable a ojo.
- **No:** IA de equipo estilo Inky/Blinky. Requeriría estado compartido y análisis más fino, para otro spec.
- **Yes:** velocidad `GHOST_SPEED` única. La diferencia se nota en la ruta, no en la velocidad.
- **No:** velocidad variable por distancia del agresor. Añade tuning sin beneficio claro.
- **Yes:** salida escalonada (uno por segundo, el agresor primero). **No:** liberación ligada a dots comidos (el clásico Pac-Man): temporizador simple por frames es suficiente aquí.
- **Yes:** patrullero en ping-pong por la fila 5 (corredor abierto continuo). Se descartó la fila 23 por estar partida por muros (`maze.js:32`).
- **Yes:** emboscador con regla Pinky (+4 en la dirección actual). **No:** predicción por intersección (más código, sensación similar).
- **Yes:** conservar los kinds `hunter` y `random` existentes y añadir `patroller` y `ambusher` (sin renombrar, no romper nada).
- **Yes:** código en `game.js`. **No:** `ghost-ai.js` (habría que tocar `index.html` sin beneficio).
- **No:** estados consumibles/asustados. Futuro spec.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Objetivo del emboscador fuera del tablero en el túnel (fila 14) | Clamp a `[0,W-1]×[0,H-1]` antes de evaluar la dirección. |
| Fantasma liberado que no encuentra la salida y rebota en la pen | Regla explícita: dentro de la pen (y∈[13,15], x∈[11,16]) avanza siempre hacia arriba, hasta la puerta. |
| Temporizador dependiente de los fps | `RELEASE_DELAY` en frames, coherente con `PACMAN_SPEED`/`GHOST_SPEED` (celda/frame); a 60 fps son ~1 s por fantasma. |
| Patrullero atascado si el camino greedy falla | La ruta pasa por un corredor contiguo; el fallback de giro 180° (`game.js:121`) ya cubre callejones. |
| Solape de celdas de inicio en la pen | 4 celdas distintas verificadas: `(13,14)`, `(13,13)`, `(14,14)`, `(13,15)`. |

## What is **not** in this spec

- Fantasmas comestibles/asustados o power-ups.
- Dispersión a zonas hogar o dependencia entre fantasmas.
- Velocidades por distancia o dificultad escalada.
- Liberación ligada a dots comidos.
- Sprites o animaciones nuevas.

Cada uno de esos, si llega, va a su propio spec.