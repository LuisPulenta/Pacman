// game.js
// Estado y reglas. Depende de globals de maze.js: MAZE, TUNNEL_ROW,
// PACMAN_START, GHOST_STARTS.

const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};
const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };

const PACMAN_SPEED = 0.125; // 1/8 celda/frame -> alinea cada 8 frames
const GHOST_SPEED = 0.1;    // 1/10 celda/frame
const PELLET_SCORE = 50;
const FRIGHTEN_TIME = 450;
const FRIGHTEN_SEQUENCE = [ 200, 400, 800, 1600 ];

// Ruta del patrullero: ping-pong entre los dos extremos del corredor abierto
// de la fila 5.
const PATROL_POINTS = [ { x: 1, y: 5 }, { x: 26, y: 5 } ];

// Frames entre liberaciones de fantasmas de la pen (~1 s a 60 fps).
const RELEASE_DELAY = 60;

// Crea una partida nueva. Copia MAZE (pristino) a game.grid para poder comer
// dots sin destruir el original, y reiniciar.
function createGame() {
  const grid = MAZE.map( ( row ) => row.slice() );
  // La celda de inicio de Pacman arranca sin dot.
  grid[ PACMAN_START.y ][ PACMAN_START.x ] = 0;

  let dots = 0;
  for ( const row of grid ) for ( const v of row ) if ( v === 2 || v === 4 ) dots++;

  return {
    state: 'start',
    score: 0,
    lives: 3,
    dotsRemaining: dots,
    ghostTimer: 0,
    frightenTimer: 0,
    frightenSeqIndex: 0,
    grid,
    pacman: {
      x: PACMAN_START.x,
      y: PACMAN_START.y,
      dir: 'left',
      nextDir: null,
      speed: PACMAN_SPEED,
    },
    ghosts: GHOST_STARTS.map( ( g, i ) => {
      const ghost = {
        x: g.x,
        y: g.y,
        dir: 'up',
        speed: GHOST_SPEED,
        kind: g.kind,
        releaseAt: i * RELEASE_DELAY,
        released: false,
        eaten: false,
      };
      if ( g.kind === 'patroller' ) ghost.patrolTarget = 0;
      return ghost;
    } ),
  };
}

function aligned( v ) {
  return Math.abs( v - Math.round( v ) ) < 1e-3;
}

// Esta la celda dentro de la pen o sobre su puerta de salida? El interior
// de la pen son las celdas (x in [11,16], y in [13,15]); y=12 es la puerta
// (cols 13-14) por la que un fantasma sale y que le bloquea el regreso.
function insidePen( x, y ) {
  return x >= 11 && x <= 16 && y >= 12 && y <= 15;
}

// Una celda es muro para el actor dado?
//   pacman: bloqueado por pared (1) y puerta (3)
//   ghost:  bloqueado por pared (1); la puerta (3) solo es transitable
//   desde dentro de la pen (salida), para que un fantasma ya liberado
//   no vuelva a entrar (anti-reentrada).
function isWall( grid, x, y, actor ) {
  if ( y < 0 || y >= grid.length ) return true;
  if ( x < 0 || x >= grid[ 0 ].length ) return true;
  const v = grid[ y ][ x ];
  if ( v === 1 ) return true;
  if ( v === 3 ) {
    if ( actor === 'pacman' ) return true;
    return !insidePen( actor.x, actor.y );
  }
  return false;
}

// Puede el actor avanzar desde (x,y) en la direccion dir?
function canMove( grid, x, y, dir, actor ) {
  const d = DIRS[ dir ];
  if ( !d ) return false;
  const tx = x + d.x;
  const ty = y + d.y;
  // Tunel: salir por un borde en la fila del tunel siempre es valido.
  if ( ty === TUNNEL_ROW && ( tx < 0 || tx >= grid[ 0 ].length ) ) return true;
  return !isWall( grid, tx, ty, actor );
}

function wrapTunnel( a, width ) {
  if ( Math.round( a.y ) === TUNNEL_ROW ) {
    if ( a.x < 0 ) a.x += width;
    else if ( a.x >= width ) a.x -= width;
  }
}

function movePacman( game ) {
  const p = game.pacman;
  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( p.x ) && aligned( p.y ) ) {
    p.x = Math.round( p.x );
    p.y = Math.round( p.y );

    // Aplicar giro pendiente si es posible.
    if ( p.nextDir && canMove( grid, p.x, p.y, p.nextDir, 'pacman' ) ) {
      p.dir = p.nextDir;
      p.nextDir = null;
    }
    // Comer dot.
    const tile = grid[ p.y ][ p.x ];
    if ( tile === 2 || tile === 4 ) {
      grid[ p.y ][ p.x ] = 0;
      game.score += tile === 4 ? PELLET_SCORE : 10;
      game.dotsRemaining--;
      if ( tile === 4 ) {
        game.frightenTimer = FRIGHTEN_TIME;
        game.frightenSeqIndex = 0;
      }
    }
    // Si no puede seguir, se detiene en la celda.
    if ( !canMove( grid, p.x, p.y, p.dir, 'pacman' ) ) return;
  }

  const d = DIRS[ p.dir ];
  p.x += d.x * p.speed;
  p.y += d.y * p.speed;
  wrapTunnel( p, width );
}

function decideGhost( game, g ) {
  const grid = game.grid;
  const p = game.pacman;

  const options = Object.keys( DIRS ).filter(
    ( dir ) => dir !== OPPOSITE[ g.dir ] && canMove( grid, g.x, g.y, dir, g )
  );
  // Sin salida (callejon): permitir el giro de 180.
  const choices = options.length ? options : [ '' + OPPOSITE[ g.dir ] ];

  // Asustado: movimiento aleatorio, sin personalidades.
  if ( game.frightenTimer > 0 ) {
    g.dir = choices[ Math.floor( Math.random() * choices.length ) ];
    return;
  }

  // Direccion del cruce que mas reduce Manhattan hacia (tx,ty).
  function aim( tx, ty ) {
    let best = choices[ 0 ];
    let bestDist = Infinity;
    for ( const dir of choices ) {
      const d = DIRS[ dir ];
      const nx = g.x + d.x;
      const ny = g.y + d.y;
      const dist = Math.abs( nx - tx ) + Math.abs( ny - ty );
      if ( dist < bestDist ) {
        bestDist = dist;
        best = dir;
      }
    }
    return best;
  }

  if ( g.kind === 'hunter' ) {
    const px = Math.round( p.x );
    const py = Math.round( p.y );
    g.dir = aim( px, py );
  } else if ( g.kind === 'patroller' ) {
    // Objetivo: el extremo de la ruta; al alcanzarlo, alterna al otro.
    const target = PATROL_POINTS[ g.patrolTarget ];
    if ( g.x === target.x && g.y === target.y ) {
      g.patrolTarget = 1 - g.patrolTarget;
    }
    const t = PATROL_POINTS[ g.patrolTarget ];
    g.dir = aim( t.x, t.y );
  } else if ( g.kind === 'ambusher' ) {
    // Regla Pinky: objetivo = Pacman + 4 celdas en su dirección actual,
    // clamped al tablero.
    const pd = DIRS[ p.dir ] || { x: 0, y: 0 };
    const tx = Math.max( 0, Math.min( grid[ 0 ].length - 1, Math.round( p.x ) + pd.x * 4 ) );
    const ty = Math.max( 0, Math.min( grid.length - 1, Math.round( p.y ) + pd.y * 4 ) );
    g.dir = aim( tx, ty );
  } else {
    g.dir = choices[ Math.floor( Math.random() * choices.length ) ];
  }
}

function moveGhost( game, g ) {
  const grid = game.grid;
  const width = grid[ 0 ].length;

  // Todavia no toca su turno: queda inmóvil dentro del pen hasta su liberacion.
  if ( !g.released ) {
    if ( game.ghostTimer >= g.releaseAt ) {
      g.released = true;
      g.eaten = false;
    } else return;
  }

  if ( aligned( g.x ) && aligned( g.y ) ) {
    g.x = Math.round( g.x );
    g.y = Math.round( g.y );
    // Dentro de la pen (incluida la fila de la puerta): sale en linea recta
    // hacia arriba por la puerta sin aplicar su personalidad.
    if ( insidePen( g.x, g.y ) ) {
      g.dir = 'up';
    } else {
      decideGhost( game, g );
    }
    if ( !canMove( grid, g.x, g.y, g.dir, g ) ) return;
  }

  const d = DIRS[ g.dir ];
  g.x += d.x * g.speed;
  g.y += d.y * g.speed;
  wrapTunnel( g, width );
}

function resetPositions( game ) {
  const p = game.pacman;
  game.ghostTimer = 0;
  game.frightenTimer = 0;
  game.frightenSeqIndex = 0;
  p.x = PACMAN_START.x;
  p.y = PACMAN_START.y;
  p.dir = 'left';
  p.nextDir = null;
  game.ghosts.forEach( ( g, i ) => {
    g.x = GHOST_STARTS[ i ].x;
    g.y = GHOST_STARTS[ i ].y;
    g.dir = 'up';
    g.released = false;
    g.eaten = false;
    if ( g.kind === 'patroller' ) g.patrolTarget = 0;
  } );
}

function collides( a, b ) {
  return Math.abs( a.x - b.x ) < 0.5 && Math.abs( a.y - b.y ) < 0.5;
}

function update( game ) {
  game.ghostTimer++;
  if ( game.frightenTimer > 0 ) game.frightenTimer--;
  movePacman( game );
  game.ghosts.forEach( ( g ) => moveGhost( game, g ) );

  for ( const g of game.ghosts ) {
    if ( collides( game.pacman, g ) ) {
      // Fantasma asustado (y no ya comido): se lo come.
      if ( game.frightenTimer > 0 && !g.eaten ) {
        const seqIndex = Math.min( game.frightenSeqIndex, FRIGHTEN_SEQUENCE.length - 1 );
        game.score += FRIGHTEN_SEQUENCE[ seqIndex ];
        game.frightenSeqIndex = Math.min( seqIndex + 1, FRIGHTEN_SEQUENCE.length - 1 );
        g.eaten = true;
        g.x = GHOST_STARTS[ game.ghosts.indexOf( g ) ].x;
        g.y = GHOST_STARTS[ game.ghosts.indexOf( g ) ].y;
        g.released = false;
        g.dir = 'up';
        g.releaseAt = game.ghostTimer + RELEASE_DELAY;
        break;
      }
      // Fantasma normal: perder una vida.
      if ( g.eaten ) continue;
      game.lives--;
      if ( game.lives <= 0 ) {
        game.state = 'lost';
        return;
      }
      resetPositions( game );
      break;
    }
  }

  if ( game.dotsRemaining <= 0 ) game.state = 'won';
}

window.createGame = createGame;
window.update = update;
window.DIRS = DIRS;
