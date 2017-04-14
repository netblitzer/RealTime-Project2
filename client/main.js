"use strict";

// game info
let gamestate = 'loading';
let loaded = {
  airplane: false,
  balloon: false,
  ready: false,
};

// server updated info
let users = undefined;
let creatures = undefined;
let userAlpha = 0.1;
let creatureAlpha = 0.1;

// our player movement
let movement = {
  down: false,
  up: false,
  right: false,
  left: false,
  space: false,
};

// connection information
let socket = undefined;
let hash = undefined;



function init () {
  canvas = document.querySelector("#mainCanvas");
  ctx = canvas.getContext("2d");

  socket = io.connect();
  
  socket.on('joined', joined);
  socket.on('joinedCreatures', joinedCreatures);
  socket.on('joinedPlayers', joinedPlayers);
  
  socket.on('updateCreatures', updateCreatures);
  socket.on('updatePlayers', updatePlayers);
  
  socket.on('addPlayer', addPlayer);
  socket.on('addCreatures', addCreatures);
  
  socket.on('removePlayer', removePlayer);
  socket.on('removeCreatures', removeCreatures);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  
  window.onmousedown = (e) => {
    getMouse(e);
    mouse.clicked = true;
  }
  window.onmouseup = (e) => {
    getMouse(e);
    mouse.clicked = false;
  }
  window.onmousemove = getMouse;
  
  window.onresize = () => fixScreenSize();

  redrawBind = redraw.bind(this);
  requestAnimationFrame(redrawBind);
  
  fixScreenSize();
  
  airplane = new Image(32, 32);
  airplane.src = '/assets/airplane.png';
  airplane.onload = () => {
    loaded.airplane = true;
    
    if (loaded.balloon) {
      loaded.ready = true;
      gamestate = 'loadTransitionOUT';
    }
  };
  
  balloon = new Image(256, 256);
  balloon.src = '/assets/balloon.png';
  balloon.onload = () => {
    loaded.balloon = true;
    
    if (loaded.airplane) {
      loaded.ready = true;
      gamestate = 'loadTransitionOUT';
    }
  };
  
  document.fonts.onloadingdone = () => {
    loaded.font = true;
    
    if (loaded.airplane && loaded.balloon) {
      loaded.ready = true;
      gamestate = 'loadTransitionOUT';
    }
  }
};

window.onload = init;