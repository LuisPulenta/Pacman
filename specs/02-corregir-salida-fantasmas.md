# SPEC 02 — Corregir salida de fantasmas de la pen

> **Status:** Implemented
> **Date:** 2026-09-14
> **Objective:** Corregir la salida de los fantasmas de la pen para que salgan caminando por la puerta desde el interior de la jaula, sin teletransportes y sin que vuelvan a entrar después de salir (anti-reentrada). Cada fantasma arranca en una celda distinta dentro de la pen.

## Scope

**In:**

- Los 4 fantasmas arrancan en `GHOST_STARTS` (dentro de la pen, una celda distinta cada uno), inmóviles hasta su liberación.
- Al liberarse (`released` pasa a `true`) el fantasma sale caminando hacia arriba por la puerta, sin aplicar su personalidad hasta haber salido de la pen.
- Anti-reentrada: la puerta (3) solo es transitable por un fantasma que está dentro de la pen; un fantasma ya liberado no puede volver a entrar.
- Tras perder una vida, `resetPositions` devuelve los fantasmas a `GHOST_STARTS` (la pen), reinicia `ghostTimer` y `released`; al liberarse vuelven a salir caminando.
- Conservar el temporizador escalonado de SPEC 01 (`RELEASE_DELAY`).
- Eliminar `GHOST_SPAWNS` y la lógica de teletransporte que se probó en versiones anteriores del spec.

**Out of scope (para futuros specs):**

- Animación de salida de la pen.
- Cambios en personalidades, velocidades o temporizadores.
- Power-ups o estados de fantasma.

## Data model

```js
// maze.js — posiciones iniciales en la pen (una celda distinta por fantasma)
const GHOST_STARTS = [
  { x: 13, y: 14, kind: "hunter" },
  { x: 13, y: 13, kind: "patroller" },
  { x: 14, y: 14, kind: "ambusher" },
  { x: 13, y: 15, kind: "random" },
];

// game.js — fantasma: { x, y, dir, speed, kind, releaseAt, released }
//   x,y iniciales en createGame = GHOST_STARTS[i]
```

## Implementation plan

1. **`maze.js`:** quitar `GHOST_SPAWNS` y su `window.GHOST_SPAWNS` (ya no se usan).
2. **`game.js`:** en `createGame`, los fantasmas arrancan en `GHOST_STARTS[i]` y sin campo `spawn`; conservar `releaseAt` y `released: false`.
3. **`game.js`:** reintroducir `insidePen`; en `moveGhost`, mientras el fantasma esté dentro de la pen se fuerza `dir = 'up'` para salir caminando por la puerta; fuera de ella aplica `decideGhost`.
4. **`game.js`:** anti-reentrada en `isWall`: la puerta (3) es muro para un fantasma salvo que su posición actual esté dentro de la pen.
5. **Revisión en navegador:** confirmar que los 4 fantasmas arrancan en celdas distintas dentro de la jaula, salen caminando y no vuelven a entrar.

## Acceptance criteria

- [x] Al cargar `src/index.html` se ven 4 fantasmas inmóviles dentro de la pen en las celdas `(13,14)`, `(13,13)`, `(14,14)` y `(13,15)`.
- [x] Al empezar, el agresor (rojo) se libera de inmediato y camina hacia arriba por la puerta; los demás salen uno por segundo.
- [x] Ningún fantasma aparece de golpe fuera de la jaula: siempre se desplaza caminando por la puerta.
- [x] Un fantasma ya liberado no vuelve a entrar por la puerta (anti-reentrada).
- [x] Tras perder una vida, los fantasmas vuelven a la pen y el ciclo de liberación se reinicia.
- [x] Tras un reinicio completo (perder todas las vidas o ganar), los fantasmas vuelven a aparecer dentro de la pen en sus celdas iniciales.
- [x] No se modifican paredes, dots, puerta, túnel ni score.

## Decisions

- **Yes:** los fantasmas arrancan dentro de la pen, uno por celda, y salen caminando por la puerta. **No:** teletransporte ni spawn en el mapa, porque el usuario quiere el desplazamiento visible desde la jaula.
- **Yes:** anti-reentrada bloqueando la puerta para fantasmas que ya salieron. **No:** dejar la puerta libre a los fantasmas, porque el cazador y el emboscador deciden volver a entrar y se atascan.
- **Yes:** inicio de partida y reinicio tras muerte dentro de la pen (`GHOST_STARTS`). Al liberarse salen caminando igual en ambos ciclos.
- **No:** animación de salida de la pen.
- **No:** cambio del temporizador escalonado ni de las personalidades.

## Risks

| Riesgo                                             | Mitigación                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| El fantasma sale y vuelve a entrar por la puerta   | `isWall`: la puerta (3) es muro salvo que la posición actual esté en la pen.    |
| Fantasma atascado en la puerta                     | Forzar `dir='up'` mientras esté dentro de la pen; salir del pen siempre hacia arriba. |
| Olvidar eliminar el teletransporte                 | Este spec elimina `GHOST_SPAWNS` y el campo `spawn` explícitamente.             |

## What is **not** in this spec

- Animación de salida de la pen.
- Nuevas personalidades o velocidades.
- Estados comestibles/asustados.
- Cambios en laberinto, dots o power-ups.

Cada uno de esos, si llega, va a su propio spec.