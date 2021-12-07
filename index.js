let express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server); // Pass server to it instead of port




let http = require('http');


let engine = require('./public/game')

let gameInterval, updateInterval

function pirateName() {
  let names = [
    'Siamese Fighting',
    'Salmon',
    'Tuna',
    'Halibut',
    'Sardines',
    'Cod ',
    'Anchovies',
    'Herring',
    'Mackerel',
    'Mahi '
  ]
  return names[Math.floor(Math.random()*names.length)]
}

// TODO: extract below

function gameLoop() {
  // move everyone around
  Object.keys(engine.players).forEach((playerId) => {
    let player = engine.players[playerId]
    engine.movePlayer(playerId)
  })
}

// ----------------------------------------
// Main server code
// ----------------------------------------

// serve css and js
app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



function emitUpdates() {
  // tell everyone what's up
  io.emit('gameStateUpdate', { players: engine.players, piece: engine.piece });
}

io.on('connection', function(socket){
  console.log('User connected: ', socket.id)
  // start game if this is the first player
  if (Object.keys(engine.players).length == 0) {
    engine.shufflepiece()
  	gameInterval = setInterval(gameLoop, 25)
    updateInterval = setInterval(emitUpdates, 40)
	}

  // get open position
  let posX = 0
  let posY = 0
  while (!engine.isValidPosition({ x: posX, y: posY }, socket.id)) {
    posX = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
  }

  // add player to engine.players obj
  engine.players[socket.id] = {
  	accel: {
  		x: 0,
  		y: 0
  	},
  	x: posX,
    y: posY,
  	colour: engine.stringToColour(socket.id),
  	score: 0,
    name: pirateName()
  }

  // set socket listeners

  socket.on('disconnect', function() {
  	delete engine.players[socket.id]
  	// end game if there are no engine.players left
  	if (Object.keys(engine.players).length > 0) {
    	io.emit('gameStateUpdate', engine.players);
  	} else {
  		clearInterval(gameInterval)
      clearInterval(updateInterval)
  	}
  })

  socket.on('up', function(msg){
    engine.accelPlayer(socket.id, 0, -1)
  });

  socket.on('down', function(msg) {
    engine.accelPlayer(socket.id, 0, 1)
  })

  socket.on('left', function(msg){
    engine.accelPlayer(socket.id, -1, 0)
  });

  socket.on('right', function(msg) {
    engine.accelPlayer(socket.id, 1, 0)
  })
});

server.listen(3000,()=> {
  console.log("server is up, app is listening on port 3000")
})
