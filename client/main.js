"use strict";

const app = app || { };

app.main = {
    // canvas drawing elements
  offCanvas: undefined,
  offCtx: undefined,
  canvas: undefined,
  ctx: undefined,
  
    // game data
  gamestate: 'ingame',
  
    // movement object for player
  movement: {
    down: false,
    up: false,
    right: false,
    left: false,
    space: false,
  },
  
    // connection information
  socket: undefined,
  id: undefined,
  users: undefined,
  creatures: undefined,
  
  update: (data) => {
    if (data.info.id === this.id) {
      return;
    }

    if (this.users[data.info.id].gameData.lastUpdate >= data.gameData.lastUpdate) {
      return;
    }

    const user = this.users[data.info.id];
    user.gameData.a_x = data.gameData.a_x;
    user.gameData.a_y = data.gameData.a_y;
    user.gameData.b_x = data.gameData.b_x;
    user.gameData.b_y = data.gameData.b_y;
    user.gameData.c_x = data.gameData.c_x;
    user.gameData.c_y = data.gameData.c_y;
    user.clientData.alpha = 0.05;
  },
  
  updatePosition: () => {
    
  },
  

  lerp3: (v0, v1, v2, alpha) => {
    return (1 - alpha) * ((1 - alpha) * v0 + alpha * v1) + ((1 - alpha) * v1 + v2 * alpha) * alpha;
  },

  redraw: (time) => {
    updatePosition();

    ctx.clearRect(0, 0, 500, 500);

    const keys = Object.keys(users);

    for (let i = 0; i < keys.length; i++) {
      const user = users[keys[i]];

      if (user.clientData.alpha < 1) {
        user.clientData.alpha += 0.05;
      }

      ctx.fillStyle = user.info.color;

      //user.clientData.x = lerp3(user.gameData.c_x, user.gameData.b_x, user.gameData.a_x, user.clientData.alpha);
      //user.clientData.y = lerp3(user.gameData.c_y, user.gameData.b_y, user.gameData.a_y, user.clientData.alpha);

      user.clientData.x = lerp2(user.gameData.c_x, user.gameData.a_x, user.clientData.alpha);
      user.clientData.y = lerp2(user.gameData.c_y, user.gameData.a_y, user.clientData.alpha);
      ctx.beginPath();
      ctx.arc(user.clientData.x, user.clientData.y, 50, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    }

    requestAnimationFrame(redraw.bind(this));
  },
  
  init: () => {
    this.canvas = document.querySelector("#canvas");
    this.ctx = canvas.getContext("2d");

    this.socket = io.connect();
    
    this.socket.on('joined', (data) => app.connection.joined());
    this.socket.on('joinedCreatures', (data) => app.connection.joinedCreatures());
    this.socket.on('joinedPlayers', (data) => app.connection.joinedPlayers());
    
    this.socket.on('updateCreatures', (data) => app.connection.updateCreatures());
    this.socket.on('updatePlayers', (data) => app.connection.updatePlayers());
    
    this.socket.on('addPlayer', (data) => app.connection.addPlayer());
    this.socket.on('addCreatures', (data) => app.connection.addCreatures());
    
    this.socket.on('removePlayer', (data) => app.connection.removePlayer());
    this.socket.on('removeCreatures', (data) => app.connection.removeCreatures());
    
    document.body.addEventListener('keydown', (e) => app.utils.keyDownHanlder());
    document.body.addEventListener('keyup', (e) => app.utils.keyUpHandler());
  },

};

(window.onload = () => {
  app.main.init();
  app.utils.fixScreenSize();
})();