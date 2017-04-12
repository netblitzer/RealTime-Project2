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
    
  },
  
  updatePosition: () => {
    
  },
  

  lerp3: (v0, v1, v2, alpha) => {
    return (1 - alpha) * ((1 - alpha) * v0 + alpha * v1) + ((1 - alpha) * v1 + v2 * alpha) * alpha;
  },

  redraw: (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let keys = Object.Keys(creatures);
    
    for (var i = 0; i < keys.length; i++) {
      
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