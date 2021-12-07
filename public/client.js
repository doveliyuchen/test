
    let socket = io();
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    // let players = {}; // this is magically defined in game.js
    let aud1=new Audio("2.wav");
      aud1.volume=0.2
      aud1.loop=false
    let localDirection // used to display accel direction
    let prescore;
    let aud=new Audio("1.mp3");
      
      aud.loop=true
      aud.volume=0.1
  
      
        
    socket.on('gameStateUpdate', updateGameState);

    function drawPlayers(players) {
      
      // draw players
      Object.keys(players).forEach((playerId) => {
        let player = players[playerId]
        let direction
        ctx.fillStyle = player.colour;
        ctx.fill()

        if (playerId == socket.id) {
          direction = localDirection
        } else {
          direction = player.direction
        }
        // draw accel direction for current player based on local variable
        // the idea here is to give players instant feedback when they hit a key
        // to mask the server lag
        
        let accelWidth = 3
        switch(direction) {
          
          case 'up':
            //console.log(aud.paused)
            if (aud.paused){
              aud.play()
            }
            ctx.beginPath();
            ctx.moveTo(player.x/5+20, player.y/5);
            ctx.lineTo(player.x/5+40, player.y/5+20);
            ctx.lineTo(player.x/5, player.y/5+20);
            //ctx.beginPath();
            ctx.moveTo(player.x/5+20, player.y/5+20);
            ctx.lineTo(player.x/5+30, player.y/5+40);
            ctx.lineTo(player.x/5+10, player.y/5+40);
            ctx.fillStyle = 'black'
            ctx.fillRect(player.x/5, player.y/5 - accelWidth, playerSize/5, accelWidth);
            break
          case 'down':
            if (aud.paused){
              aud.play()
            }
            ctx.beginPath();
            ctx.moveTo(player.x/5+20, player.y/5+ playerSize/5);
            ctx.lineTo(player.x/5+40, player.y/5-20+ playerSize/5);
            ctx.lineTo(player.x/5, player.y/5-20+ playerSize/5);
            //ctx.beginPath();
            ctx.moveTo(player.x/5+20, player.y/5-20+ playerSize/5);
            ctx.lineTo(player.x/5+30, player.y/5-40+ playerSize/5);
            ctx.lineTo(player.x/5+10, player.y/5-40+ playerSize/5);
            ctx.fillStyle = 'black'
            ctx.fillRect(player.x/5, player.y/5  + playerSize/5, playerSize/5, accelWidth);
            break
          case 'left':
            if (aud.paused){
              aud.play()
            }
            ctx.beginPath();
            ctx.moveTo(player.x/5, player.y/5+20);
            ctx.lineTo(player.x/5+20, player.y/5+40);
            ctx.lineTo(player.x/5+20, player.y/5);
            //ctx.beginPath();
            ctx.moveTo(player.x/5+20, player.y/5+20);
            ctx.lineTo(player.x/5+40, player.y/5+30);
            ctx.lineTo(player.x/5+40, player.y/5+10);
            ctx.fillStyle = 'black'
            ctx.fillRect(player.x/5 - accelWidth, player.y/5, accelWidth, playerSize/5);
            break
          case 'right':
            if (aud.paused){
              aud.play()
            }
            ctx.beginPath();
            ctx.moveTo(player.x/5+ playerSize/5, player.y/5+20);
            ctx.lineTo(player.x/5-20+ playerSize/5, player.y/5+40);
            ctx.lineTo(player.x/5-20+ playerSize/5, player.y/5);
            //ctx.beginPath();
            ctx.moveTo(player.x/5-20+ playerSize/5, player.y/5+20);
            ctx.lineTo(player.x/5-40+ playerSize/5, player.y/5+30);
            ctx.lineTo(player.x/5-40+ playerSize/5, player.y/5+10);
            ctx.fillStyle = 'black'
            ctx.fillRect(player.x/5 + playerSize/5, player.y/5, accelWidth, playerSize/5);

        }
      })
    }

    function updateGameState(gameState) {
      // update local state to match state on server
      players = gameState.players
      piece = gameState.piece
      // draw stuff

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // set score info
      let playerCount = Object.keys(players).length
      
      document.getElementById('playerCount').innerHTML = String(playerCount) + " fish" +  " in the salty seas"
      let scores = ''
      Object.values(players).sort((a,b) => (b.score - a.score)).forEach((player, index) => {
        scores += "<p><span style='color: " + player.colour + ";'>" + player.name + "</span> has " + player.score + " piece(s) of food</p>"
        document.getElementById('intro').innerHTML= "You are "+"<span style='color: " + player.colour + ";'>" + player.name + "</span>"+"!"+"<br>"+"Use 'w','a','s','d' or arrow keys to control it!"
      })


     
      document.getElementById('scores').innerHTML = scores

      // draw piece
      ctx.beginPath();
      ctx.arc((piece.x + pieceSize/2)/5, (piece.y + pieceSize/2)/5, pieceSize/5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'gold';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#003300';
      ctx.stroke();

      drawPlayers(players)
    }

    // key handling
    $('html').keydown(function(e) {
      if (e.key == "ArrowDown"||e.key == "s"||e.key == "S") {
        
        
        socket.emit('down', players);
        accelPlayer(socket.id, 0, 1)
        localDirection = 'down'
      } else if (e.key == "ArrowUp"||e.key == "w"||e.key == "W") {
        if (aud.ended){
          aud.play()
        }
        socket.emit('up', players);
        accelPlayer(socket.id, 0, -1)
        localDirection = 'up'
      } else if (e.key == "ArrowLeft"||e.key == "a"||e.key == "A") {
        if (aud.ended){
          aud.play()
        }
        socket.emit('left', players);
        accelPlayer(socket.id, -1, 0)
        localDirection = 'left'
      } else if (e.key == "ArrowRight"||e.key == "d"||e.key == "D") {
        if (aud.ended){
          aud.play()
        }
        socket.emit('right', players);
        accelPlayer(socket.id, 1, 0)
        localDirection = 'right'
      }
    })

    function gameLoop() {
      // update game
      updateGameState({players: players, piece: piece})
      
      // move everyone around
      Object.keys(players).forEach((playerId) => {
        let player = players[playerId]
      
        // if(player.score!=prescore){
        //   aud1.play();
        //   prescore=player.score;
        // }
        movePlayer(playerId)
      })
    }

    function drawGame() {
      // draw stuff
      drawPlayers(players)
      requestAnimationFrame(drawGame)
    }

    setInterval(gameLoop, 25)
    requestAnimationFrame(drawGame)

