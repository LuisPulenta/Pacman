# SPEC 03 — Power Pellets y fantasmas comestibles

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-14
> **Objective:** Añadir 4 Power Pellets al laberinto que, al comerlos, dejen a Pacman comer fantasmas durante un tiempo limitado, con puntos que se duplican por secuencia.

## Scope

**In:**

- 4 Power Pellets codificados en la grid como valor `4` (nuevo carácter `o` en `MAZE_STR` → `parseTile` → `4`), en las posiciones clásicas `(1,3)`, `(26,3)`, `(1,23)` y `(26,23)`.
- Comer un Power Pellet da `PELLET_SCORE = 50` puntos, cuenta para `dotsRemaining` (necesario para ganar, igual que un dot) y activa el estado asustado global.
- Estado asustado global `FRIGHTEN_TIME = 450` frames (~7,5 s a 60 fps): todos los fantasmas liberados se vuelven comestibles y se dibujan azules.
- Mientras asustados, los fantasmas se mueven aleatorio a la misma `GHOST_SPEED` (sin cambio de velocidad).
- Colisión con fantasma asustado: Pacman se lo come, no pierde vida. Puntos según `FRIGHTEN_SEQUENCE = [200, 400, 800, 1600]`, reiniciada a 200 al comer un nuevo pellet.
- Fantasma comido: se teletransporta a su celda del pen (`GHOST_STARTS`), queda marcado `eaten`, se dibuja solo con ojos, y se re-libera a su spawn tras `RELEASE_DELAY` (~1 s) como fantasma normal.
- Comer un segundo pellet con el estado ya activo reinicia `FRIGHTEN_TIME` a su valor completo y la secuencia de puntos a 200.
- Al reiniciar posiciones tras perder una vida se limpian `frightenTimer` y `frightenSeqIndex`.

**Out of scope (para futuros specs):**

- Parpadeo blanco/azul de aviso antes de recuperarse.
- Texto flotante de puntos (200/400/...) en pantalla al comer un fantasma.
- Velocidad reducida de fantasmas asustados o velocidades variables.
- Sonidos, animaciones o sprites nuevos.
- Escalado de duración/velocidad por nivel o dificultad.

## Data model

```js
// maze.js — leyenda: 'o' → 4 (Power Pellet). Se sustituyen los 4 dots
// de las esquinas por 'o' en MAZE_STR.
//   'o' en filas 3 y 23, columnas 1 y 26:
//     (1,3), (26,3), (1,23), (26,23)
// La grid es la fuente de verdad: no hace falta lista aparte de posiciones.

// game.js
const PELLET_SCORE = 50; // puntos del Power Pellet
const FRIGHTEN_TIME = 450; // frames del estado asustado (~7,5 s a 60 fps)
const FRIGHTEN_SEQUENCE = [200, 400, 800, 1600]; // puntos por fantasma comido

// game: { ..., frightenTimer, frightenSeqIndex, grid, ... }
//   frightenTimer: 0 → normal; > 0 → asustado, decrece 1 por frame en update.
//   frightenSeqIndex: índice en FRIGHTEN_SEQUENCE; se reinicia a 0 al comer
//   un Power Pellet.
// ghost: { x, y, dir, speed, kind, releaseAt, released, spawn, eaten }
//   eaten: true mientras el fantasma espera en el pen tras ser comido.
```

- `dotsRemaining` inicial cuenta los valores `2` y `4` (no solo los dots).
- En `movePacman`, comer el valor `4` pone la celda a `0` igual que un dot.
- El estado asustado es global: no hay flag por fantasma para la duración.

## Implementation plan

1. **`maze.js`:** ampliar la leyenda con `'o' → 4` en `parseTile` y sustituir los 4 dots de las esquinas por `'o'`. **`render.js`:** `drawDots` dibuja el valor `4` como un dot grande (radio ~5 en lugar de 2,5). La partida sigue jugándose; los pellets aún no se comen ni cuentan (degradado temporal, solo visual). Verificación: cargar la página y ver 4 pellets grandes en las esquinas.
2. **`game.js`:** en `createGame`, contar `dotsRemaining` sobre valores `2` y `4`; en `movePacman`, al comer un valor `4` sumar `PELLET_SCORE`, decrementar `dotsRemaining`, poner `frightenTimer = FRIGHTEN_TIME` y `frightenSeqIndex = 0` (re-trigger reinicia ambos). Añadir en `update` el decremento de `frightenTimer` (si `> 0`). El pellet ya se come y activa el temporizador. Verificación: comer un pellet suma 50 y los fantasmas aún no cambian.
3. **`game.js`:** en `decideGhost`, al inicio devolver dirección aleatoria (la misma rama del kind `random`) cuando `game.frightenTimer > 0`, antes de evaluar personalidades. **`render.js`:** el color del fantasma pasa a azul (p.ej. `'#2121ff'`) mientras `frightenTimer > 0`, en lugar de su color de índice. Verificación: al comer un pellet los fantasmas se ponen azules y se mueven aleatorio; a los 450 frames vuelven a la normalidad.
4. **`game.js`:** colisión de comerse un fantasma. En el bucle de `update`, si `collides(pacman, g)` y `frightenTimer > 0` y no `g.eaten`: sumar `FRIGHTEN_SEQUENCE[frightenSeqIndex]` (clampado a ó la secuencia), incrementar `frightenSeqIndex` (sin pasar del último índice), marcar `g.eaten = true`, teletransportar a `GHOST_STARTS[i]`, `g.released = false`, `g.dir = 'up'`, `g.releaseAt = game.ghostTimer + RELEASE_DELAY`. Si no se cumple esa condición, se mantiene la pérdida de vida actual. Verificación: comerse un fantasma azul no cuesta vida y suma 200/400/800/1600.
5. **`game.js`:** re-liberación del comido. En `moveGhost`, al liberarse (`ghostTimer >= releaseAt`) quitar `g.eaten` y teletransportar al spawn como ya hace el bloque actual (`SPEC 02`), de modo que el comido sale del pen como fantasma normal tras ~1 s. Verificación: un fantasma comido aparece como ojos en el pen y ~1 s después reaparece entero en su spawn.
6. **`game.js` + `render.js`:** modo ojos. En `render.js`, si `g.eaten` dibujar solo los dos ojos (sin cuerpo). En `game.js`, `resetPositions` pone `frightenTimer = 0`, `frightenSeqIndex = 0` y `g.eaten = false` en todos los fantasmas. Verificación: al perder una vida se limpian el estado asustado y los fantasmas vuelven a la pen normales.
7. **Revisión en navegador** (plan final): confirmar el ciclo completo — comer pellet (azules) → comerse fantasmas en secuencia 200/400/800/1600 → recuperación a los 450 frames → fantasma comido re-liberado ~1 s después → victoria alcanzable (pellets cuentan para `dotsRemaining`).

## Acceptance criteria

- [ ] Cargar `src/index.html` sin errores: se ven 4 pellets más grandes que los dots en `(1,3)`, `(26,3)`, `(1,23)` y `(26,23)`.
- [ ] Comer un Power Pellet suma 50 puntos, decrementa `dotsRemaining` y pone a los fantasmas liberados azules durante 450 frames.
- [ ] Con el estado asustado activo, Pacman puede atravesar/collisionar con un fantasma sin perder vida: se lo come.
- [ ] Los fantasmas comidos puntúan 200, 400, 800 y 1600 en ese orden por Power Pellet; al comer otro pellet la secuencia vuelve a 200.
- [ ] Tras 450 frames (o al comer un segundo pellet, que reinicia la duración), los fantasmas vuelven a su color normal y vuelven a costar vida.
- [ ] Un fantasma comido se teletransporta al pen, se dibuja solo con los ojos y se re-libera a su spawn como fantasma normal tras `RELEASE_DELAY`.
- [ ] La colisión con un fantasma no asustado sigue costando vida y reiniciando posiciones, y ese reinicio limpia el estado asustado (los fantasmas no reaparecen azules).
- [ ] No cambian paredes, puerta, túnel, `GHOST_STARTS` ni `GHOST_SPAWNS` respecto del estado actual.
- [ ] Se puede ganar la partida: `dotsRemaining` incluye los pellets y llega a 0.

## Decisions

- **Yes:** pellets codificados como valor `4` en la grid (carácter `o`). **No:** array de coordenadas aparte — la grid ya es la fuente de verdad y el render/come-fantasma comparte la misma lógica que los dots.
- **Yes:** posiciones clásicas `(1,3)`, `(26,3)`, `(1,23)`, `(26,23)`. Coinciden con celdas abiertas con dot del `MAZE` actual.
- **Yes:** `PELLET_SCORE = 50` y `FRIGHTEN_TIME = 450` frames fijos. **No:** duración/velocidad por nivel — partida simple sin dificultad escalada.
- **Yes:** movimiento aleatorio a la misma `GHOST_SPEED` cuando asustados. **No:** velocidad reducida ni IA de huida — menos código y la rama aleatoria ya existe (`decideGhost`, kind `random`).
- **Yes:** estado asustado global con `frightenTimer` y secuencia global `frightenSeqIndex`. **No:** duración por fantasma — el clásico es global y evita estados mezclados.
- **Yes:** fantasma comido → pen (`GHOST_STARTS`) + `releaseAt = ghostTimer + RELEASE_DELAY`. **No:** respawn instantáneo en el spawn — el retraso de ~1 s da feedback y reutiliza la liberación escalonada de `SPEC 01`.
- **Yes:** re-trigger de pellet reinicia duración y secuencia. **No:** ignorar el segundo pellet.
- **Yes:** azul + modo ojos al ser comido. **No:** parpadeo de aviso, texto flotante ni sonidos.
- **Yes:** `FRIGHTEN_SEQUENCE = [200, 400, 800, 1600]` (clásico). **No:** puntos fijos.

## Risks

| Riesgo                                                                      | Mitigación                                                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Los pellets no cuentan en `dotsRemaining` y la victoria se vuelve imposible | Paso 2 del plan hace que `dotsRemaining` cuente `4` además de `2`.                                  |
| Reinicio tras muerte conserva el estado asustado                            | `resetPositions` limpia `frightenTimer`, `frightenSeqIndex` y `eaten` (paso 6).                     |
| Secuencia de puntos fuera de rango al comer más de 4 fantasmas              | Clamp del índice al último elemento de `FRIGHTEN_SEQUENCE`.                                         |
| Colisión con un fantasma `eaten` dentro del pen                             | El pen es inaccesible para Pacman (la puerta lo bloquea) y el borde de colisión ignora `g.eaten`.   |
| Decisión aleatoria del estado asustado heredada por el kind `random`        | Se cubre: `decideGhost` ramifica por `frightenTimer` antes de las personalidades, sin solaparse.    |
| `releaseAt` del comido depende del `ghostTimer` global continuo             | Se fija `releaseAt = ghostTimer + RELEASE_DELAY` en el momento de comer, no se reutiliza el índice. |

## What is **not** in this spec

- Parpadeo previo (blanco/azul) antes de la recuperación.
- Texto flotante de puntos ni animaciones de "comido".
- Reducción de velocidad de fantasmas asustados o IA de huida.
- Sonidos y sprites nuevos.
- Duración/escala variable por nivel.

Cada uno de esos, si llega, va a su propio spec.
