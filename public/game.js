let players = {}
let piece = {} // the thing everyone's chasing

const gameSize = 4000; 

const playerSize = 200; 
const pieceSize = 50
const maxAccel = 10

function checkCollision(obj1, obj2) {
  return(Math.abs(obj1.x - obj2.x) <= playerSize && Math.abs(obj1.y - obj2.y) <= playerSize)
}

function isValidPosition(newPosition, playerId) {
  // bounds check
  if (newPosition.x < 0 || newPosition.x + playerSize > gameSize) {
    return false
  }
  if (newPosition.y < 0 || newPosition.y + playerSize > gameSize) {
    return false
  }
  // collision check
  let hasCollided = false


  Object.keys(players).forEach((key) => {
    if (key == playerId) { return } // ignore current player in collision check
    player = players[key]
    // if the players overlap. hope this works
    if (checkCollision(player, newPosition)) {
      hasCollided = true
      return // don't bother checking other stuff
    }
  })
  if (hasCollided) {
    return false
  }

  return true
}

function shufflepiece() {
  let posX = Math.floor(Math.random() * Number(gameSize) - 100) + 10
  let posY = Math.floor(Math.random() * Number(gameSize) - 100) + 10

  while (!isValidPosition({ x: posX, y: posY }, '_piece')) {
    posX = Math.floor(Math.random() * Number(gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(gameSize) - 100) + 10
  }

  piece.x = posX
  piece.y = posY
}

function movePlayer(id) {

  let player = players[id]

  let newPosition = {
    x: player.x + player.accel.x,
    y: player.y + player.accel.y
  }
  if (isValidPosition(newPosition, id)) {
    // move the player and increment score
    player.x = newPosition.x
    player.y = newPosition.y
  } else {
    // don't move the player
    // kill accel
    player.accel.x = 0
    player.accel.y = 0
  }

  if (checkCollision(player, piece)) {
    player.score += 1
 
    

    shufflepiece()
  }
}

function accelPlayer(id, x, y) {
  let player = players[id]
  let currentX = player.accel.x
  let currentY = player.accel.y

  // set direction stuff - only used for UI
  if (x > 0) {
    player.direction = 'right'
  } else if (x < 0) {
    player.direction = 'left'
  } else if (y > 0) {
    player.direction = 'down'
  } else if (y < 0) {
    player.direction = 'up'
  }

  if (Math.abs(currentX + x) < maxAccel) {
    player.accel.x += x
  }
  if (Math.abs(currentY + y) < maxAccel) {
    player.accel.y += y
  }
}


function stringToColour(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

if (!this.navigator) { // super hacky thing to determine whether this is a node module or inlined via script tag
  module.exports = {
    players: players,
    stringToColour: stringToColour,
    accelPlayer: accelPlayer,
    movePlayer: movePlayer,
    playerSize: playerSize,
    gameSize: gameSize,
    isValidPosition: isValidPosition,
    piece: piece,
    shufflepiece: shufflepiece
  }
}
