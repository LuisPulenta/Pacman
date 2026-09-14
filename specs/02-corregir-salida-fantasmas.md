# SPEC 02 — Corregir salida de fantasmas de la pen

> **Status:** Approved
> **Date:** 2026-09-14
> **Objective:** Corregir la salida de los fantasmas de la pen teletransportándolos a puntos de aparición en el mapa al liberarse, para evitar que se atascen en la jaula.

## Scope

**In:**

- Definir `GHOST_SPAWNS` en `maze.js` con 4 celdas abiertas del mapa, una por fantasma.
- Al inicio de partida los 4 fantasmas aparecen en `GHOST_SPAWNS`, inmóviles hasta su liberación.
- Al liberarse (`released` pasa a `true`) el fantasma se teletransporta a su spawn y empieza a moverse con su personalidad; no sale caminando de la pen.
- Tras perder una vida, `resetPositions` devuelve los fantasmas a `GHOST_STARTS` (la pen), reinicia `ghostTimer` y `released`; al liberarse se teletransportan de nuevo a su spawn.
- Conservar el temporizador escalonado de SPEC 01 (`RELEASE_DELAY`).
- Eliminar la lógica `insidePen` y el forzado `dir = 'up'` de `moveGhost` en `game.js`.

**Out of scope (para futuros specs):**

- Animación de salida de la pen.
- Cambios en personalidades, velocidades o temporizadores.
- Power-ups o estados de fantasma.

## Data model

```js
// maze.js — posiciones iniciales en la pen (para reinicios tras muerte)
const GHOST_STARTS = [
  { x: 13, y: 14, kind: "hunter" },
  { x: 13, y: 13, kind: "patroller" },
  { x: 14, y: 14, kind: "ambusher" },
  { x: 13, y: 15, kind: "random" },
];

// maze.js — puntos de aparición en el mapa
const GHOST_SPAWNS = [
  { x: 13, y: 11 }, // hunter
  { x: 14, y: 11 }, // ambusher
  { x: 12, y: 11 }, // patroller
  { x: 15, y: 11 }, // random
];

// game.js — fantasma: { x, y, dir, speed, kind, releaseAt, released, spawn }
//   x,y iniciales en createGame = GHOST_SPAWNS[i]
//   spawn = copia de GHOST_SPAWNS[i] para el teletransporte tras reinicio
```

## Implementation plan

1. **`maze.js`:** añadir `GHOST_SPAWNS` con las 4 celdas de arriba y exponerla como `window.GHOST_SPAWNS`. El juego sigue funcionando porque aún no se usa.
2. **`game.js`:** en `createGame`, colocar los fantasmas en `GHOST_SPAWNS[i]` (no en `GHOST_STARTS`) y guardar `spawn` en cada objeto fantasma; conservar `releaseAt` y `released: false`.
3. **`game.js`:** en `moveGhost`, eliminar `insidePen` y el forzado `dir = 'up'`; al liberarse, si el fantasma no está ya en su spawn, teletransportarlo a `g.spawn.x/g.spawn.y` con `dir='up'`. Si ya está en el spawn (inicio de partida), simplemente empieza a moverse.
4. **`game.js`:** eliminar la función `insidePen` ya que deja de usarse.
5. **Revisión en navegador:** confirmar que ningún fantasma se atasca y que tras perder una vida el ciclo se repite.

## Acceptance criteria

- [ ] Al cargar `src/index.html` se ven 4 fantasmas inmóviles en las celdas `(13,11)`, `(14,11)`, `(12,11)` y `(15,11)`.
- [ ] Al empezar, el agresor (rojo) se libera de inmediato y empieza a moverse desde su spawn; los demás salen uno por segundo.
- [ ] Ningún fantasma intenta salir caminando de la pen ni queda atrapado en la puerta.
- [ ] Tras perder una vida, los fantasmas vuelven a la pen y el ciclo de liberación se reinicia.
- [ ] Tras un reinicio completo (perder todas las vidas o ganar), los fantasmas vuelven a aparecer en los spawns del mapa.
- [ ] No se modifican paredes, dots, puerta, túnel ni score.

## Decisions

- **Yes:** spawn fijos en el mapa y teletransporte al liberarse. **No:** forzar la salida por la puerta, porque el cazador y el emboscador deciden volver a entrar.
- **Yes:** 4 spawn points distintos pero cercanos a la salida del pen. **No:** spawn compartido, para que no se solapen visualmente.
- **Yes:** inicio de partida en spawns del mapa; reinicio tras muerte en la pen. El usuario eligió esta combinación aunque es visualmente inconsistente: el primer ciclo empieza fuera, los siguientes empiezan dentro.
- **No:** animación de salida de la pen.
- **No:** cambio del temporizador escalonado ni de las personalidades.

## Risks

| Riesgo                                             | Mitigación                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Spawn sobre una pared o un dot                     | Celdas verificadas en `maze.js:11` (`x=12..15`, `y=11` son espacios abiertos). |
| Teletransporte justo encima de Pacman              | Pacman inicia en `(13,23)`; los spawns están en `y=11`, lejos.                 |
| Inconsistencia visual: inicio fuera, muerte dentro | Documentada en decisions; aceptada por el usuario.                             |
| Olvidar eliminar `insidePen`                       | Paso 4 del plan lo elimina explícitamente.                                     |

## What is **not** in this spec

- Animación de salida de la pen.
- Nuevas personalidades o velocidades.
- Estados comestibles/asustados.
- Cambios en laberinto, dots o power-ups.

Cada uno de esos, si llega, va a su propio spec.
