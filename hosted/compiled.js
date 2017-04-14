"use strict";

// game info

var gamestate = 'loading';
var loaded = {
  airplane: false,
  balloon: false,
  font: false,
  ready: false
};

// server updated info
var users = undefined;
var creatures = undefined;
var userAlpha = 0.1;
var creatureAlpha = 0.1;

// our player movement
var movement = {
  down: false,
  up: false,
  right: false,
  left: false,
  space: false
};

// connection information
var socket = undefined;
var hash = undefined;

function init() {
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

  window.onmousedown = function (e) {
    getMouse(e);
    mouse.clicked = true;
  };
  window.onmouseup = function (e) {
    getMouse(e);
    mouse.clicked = false;
  };
  window.onmousemove = getMouse;

  window.onresize = function () {
    return fixScreenSize();
  };

  redrawBind = redraw.bind(this);
  requestAnimationFrame(redrawBind);

  fixScreenSize();

  airplane = new Image(32, 32);
  airplane.src = '/assets/airplane.png';
  airplane.onload = function () {
    loaded.airplane = true;

    if (loaded.font && loaded.balloon) {
      loaded.ready = true;
      gamestate = 'loadTransitionOUT';
    }
  };

  balloon = new Image(256, 256);
  balloon.src = '/assets/balloon.png';
  balloon.onload = function () {
    loaded.balloon = true;

    if (loaded.font && loaded.airplane) {
      loaded.ready = true;
      gamestate = 'loadTransitionOUT';
    }
  };

  document.fonts.onloadingdone = function () {
    loaded.font = true;

    if (loaded.airplane && loaded.balloon) {
      loaded.ready = true;
      gamestate = 'loadTransitionOUT';
    }
  };
};

window.onload = init;
'use strict';

var mouse = {
  x: 0,
  y: 0,
  clicked: false
};

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    movement.up = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      movement.left = true;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        movement.down = true;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          movement.right = true;
        }
        // SPACE
        else if (keyPressed === 32) {
            movement.space = true;
          }

  // tell the server of the update
  socket.emit('move', movement);

  e.preventDefault();
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    movement.up = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      movement.left = false;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        movement.down = false;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          movement.right = false;
        }
        // SPACE
        else if (keyPressed === 32) {
            movement.space = false;
          }

  // tell the server of the update
  socket.emit('move', movement);

  e.preventDefault();
};

var fixScreenSize = function fixScreenSize() {
  canvas.width = window.innerWidth; //document.querySelector('body').innerWidth;
  canvas.height = window.innerHeight; //document.querySelector('body').innerHeight;

  center.x = window.innerWidth / 2;
  center.y = window.innerHeight / 2;
  center.width = window.innerWidth;
  center.height = window.innerHeight;
};

var lerp3 = function lerp3(v0, v1, v2, alpha) {
  return (1 - alpha) * ((1 - alpha) * v0 + alpha * v1) + ((1 - alpha) * v1 + v2 * alpha) * alpha;
};

var getMouse = function getMouse(e) {
  mouse.x = e.pageX - e.target.offsetLeft;
  mouse.y = e.pageY - e.target.offsetTop;
};
"use strict";

// handler to load level and the connected player
// does not load other players or creature information
var joined = function joined(m) {
  if (m === undefined || m.user === undefined) return;

  // set the user
  hash = m.hash;
  users[hash] = m.user;
};

// handler to load creatures in
var joinedCreatures = function joinedCreatures(m) {
  if (m === undefined || m.data === undefined) return;

  creatures = m.data;
};

// handler to load other players in
var joinedPlayers = function joinedPlayers(m) {
  if (m === undefined) return;

  users = m.data;
};

var addPlayer = function addPlayer(m) {
  if (m === undefined) return;

  if (!users[m.hash]) {
    users[m.hash] = m.user;
  }
};

var addCreatures = function addCreatures(m) {
  if (m === undefined) return;
};

var removePlayer = function removePlayer(m) {
  if (m === undefined) return;

  if (users[m.hash]) {
    delete users[m.hash];
  }
};

var removeCreatures = function removeCreatures(m) {
  if (m === undefined) return;
};

var updateCreatures = function updateCreatures(m) {
  if (m === undefined) return;

  var keys = Object.keys(m);
  for (var i = 0; i < keys.length; i++) {
    var cre = m[keys[i]];

    if (cre.lastUpdate < creatures[keys[i]].position.lastUpdate) {
      continue;
    }

    creatures[keys[i]].position = cre;
  }

  creatureAlpha = 0.1;
};

var updatePlayers = function updatePlayers(m) {
  if (m === undefined) return;

  var keys = Object.keys(m);
  for (var i = 0; i < keys.length; i++) {
    var ply = m[keys[i]];

    if (ply.lastUpdate < users[keys[i]].position.lastUpdate) {
      continue;
    }

    users[keys[i]].position = ply;
  }

  userAlpha = 0.1;
};
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// drawing variables
var offCanvas = undefined;
var offCtx = undefined;
var canvas = undefined;
var ctx = undefined;
var redrawBind = undefined;

// resources
var airplane = undefined;
var balloon = undefined;
var center = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

var Balloon = function Balloon(_pos, _midPos, _finalPos, _shiftPos, _bounceUp, _scale) {
  _classCallCheck(this, Balloon);

  this.pos = _pos;
  this.midPos = _midPos;
  this.finalPos = _finalPos;
  this.shiftPos = _shiftPos;
  this.scale = _scale;
  this.bounceUp = _bounceUp;
  this.dir = 1;
  this.curY = 0;
  this.speed = 0;
};

// time info


var dT = 0;
var lastTime = new Date().getTime();

// * GAMESTATES * //
// loading
// loadTransitionOUT
// menuTransitionIN
// menu
// menuTransitionOUT
// gameTransitionIN
// inGame
// gameTransitionOUT

// variables for screen transitions
var load = {
  progress: 0,
  fade: 0
};
var menuIn = {
  balloons: [],
  finalBalloons: [],
  fade: 0,
  wordFade: 0,
  dwordFade: 0,
  progress: 0
};
var menu = {
  balloons: [],
  buttonActive: false
};
var game = {
  fade: 0,
  buttonActive: false
};

// draw loop
var redraw = function redraw() {
  var time = new Date();
  var curTime = time.getTime();
  dT = (curTime - lastTime) / 1000;
  lastTime = curTime;

  var offset = {
    x: 0,
    y: 0
  };
  if (center.width > 900) {
    offset.x = center.x - 450;
  }
  if (center.height > 900) {
    offset.y = center.y - 450;
  }

  // * DRAWING AND TRANSITIONS * //

  if (gamestate === 'loading') {

    ctx.save();

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#FFF';

    var pos = {
      x: Math.cos(load.progress) * 50,
      y: Math.sin(load.progress) * 50
    };

    ctx.beginPath();
    ctx.arc(center.x - pos.x, center.y - pos.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center.x + pos.x, center.y + pos.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

    // draw the load text
    ctx.font = '15px Lato';
    ctx.fontWeight = 300;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillRect(center.x - 30, center.y - 15, 60, 30);
    ctx.fillStyle = '#000';
    ctx.fillText('Loading', center.x, center.y + 8);

    load.progress += dT * 5;
    if (load.progress > Math.PI) {
      load.progress -= Math.PI;
    }
  } else if (gamestate === 'loadTransitionOUT') {

    ctx.save();

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#FFF';

    var _pos2 = {
      x: Math.cos(load.progress) * 50,
      y: Math.sin(load.progress) * 50
    };

    ctx.beginPath();
    ctx.arc(center.x - _pos2.x, center.y - _pos2.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center.x + _pos2.x, center.y + _pos2.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

    // draw the ready text
    ctx.font = '15px Lato';
    ctx.fontWeight = 300;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillRect(center.x - 30, center.y - 15, 60, 30);
    ctx.fillStyle = '#000';
    ctx.fillText('Ready', center.x, center.y + 8);

    ctx.save();

    ctx.globalAlpha = load.fade;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    load.progress += dT * 5;
    if (load.progress > Math.PI) {
      load.progress -= Math.PI;
    }
    load.fade += dT;
    if (load.fade > 1) {
      load.fade = 0;
      gamestate = 'menuTransitionIN';

      // add balloons for the transition
      var numB = Math.floor(Math.random() * 8 + 8);
      var scale = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < numB; i++) {

        var _pos3 = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000
        };
        var final = {
          x: _pos3.x,
          y: -Math.random() * 1200 - 400
        };
        var shift = {
          x: _pos3.x,
          y: final.y + Math.random() * 100 * scale
        };
        var mid = {
          x: _pos3.x,
          y: Math.random() * 0.5 * (final.y + _pos3.y)
        };

        menuIn.balloons[i] = new Balloon(_pos3, mid, final, shift, (Math.random() * 25 + 25) * scale, scale);
        scale += Math.random() * 0.1;
      }

      // add balloons for the menu
      numB = Math.floor(Math.random() * 5 + 5);
      scale = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < numB; i++) {

        var _pos4 = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000
        };
        var _final = {
          x: _pos4.x,
          y: Math.random() * 400 + 100
        };
        var _shift = {
          x: _pos4.x,
          y: _final.y + Math.random() * 100 * scale
        };
        var _mid = {
          x: _pos4.x,
          y: Math.random() * 0.5 * (_final.y + _pos4.y)
        };

        menuIn.finalBalloons[i] = new Balloon(_pos4, _mid, _final, _shift, (Math.random() * 25 + 25) * scale, scale);
        scale += Math.random() * 0.1;
      }

      menuIn.progress = 0;
      menuIn.fade = 1;
      menuIn.wordFade = 0;
      menuIn.dwordFade = 0;
    }
  } else if (gamestate === 'menuTransitionIN') {

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000';

    ctx.beginPath();
    ctx.moveTo(offset.x, offset.y);
    ctx.lineTo(offset.x, offset.y + 900);
    ctx.lineTo(offset.x + 900, offset.y + 900);
    ctx.lineTo(offset.x + 900, offset.y);
    ctx.closePath();
    ctx.stroke();

    ctx.translate(offset.x, offset.y);

    // draw balloons
    var b = undefined;
    var _pos5 = {
      x: 0,
      y: 0
    };
    for (var i = 0; i < menuIn.balloons.length; i++) {
      b = menuIn.balloons[i];

      if (menuIn.progress < 2) {
        _pos5.x = b.pos.x;
        _pos5.y = lerp3(b.pos.y, b.finalPos.y, b.finalPos.y, menuIn.progress / 2);
      } else {
        _pos5.x = b.pos.x;
        _pos5.y = b.finalPos.y;
      }
      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(_pos5.x - 128 * b.scale, _pos5.y - 128 * b.scale);

      ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

      ctx.restore();
    }
    if (menuIn.progress > 0.1) {
      for (var i = 0; i < menuIn.finalBalloons.length; i++) {
        b = menuIn.finalBalloons[i];

        if (menuIn.progress < 2.1) {
          _pos5.x = b.pos.x;
          _pos5.y = lerp3(b.pos.y, b.finalPos.y, b.finalPos.y, (menuIn.progress - 0.1) / 2);
          b.curY = _pos5.y;
        } else {
          _pos5.x = b.pos.x;
          if (b.curY > b.finalPos.y + b.bounceUp && b.dir === 1) {
            b.dir = -1;
          } else if (b.curY < b.finalPos.y && b.dir === -1) {
            b.dir = 1;
          }

          b.speed += dT * 0.5 * b.scale * b.dir;
          b.curY += b.speed;
          _pos5.y = b.curY;
        }

        ctx.save();

        ctx.fillStyle = '#FFF';
        ctx.translate(_pos5.x - 128 * b.scale, _pos5.y - 128 * b.scale);

        ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

        ctx.restore();
      }
    }

    // text rendering
    ctx.save();

    ctx.fillStyle = '#000';
    ctx.fontWeight = 300;
    ctx.textAlign = 'right';
    if (menuIn.wordFade < 1 && menuIn.progress > 2) {
      ctx.save();

      ctx.globalAlpha = menuIn.wordFade;

      ctx.font = '300 30px Lato';
      ctx.fillText('Paper Balloons', 875, 600);

      ctx.restore();
      menuIn.wordFade += dT * 0.5;
    } else if (menuIn.wordFade >= 1 && menuIn.progress > 2) {
      menuIn.wordFade = 1;
      ctx.save();

      ctx.font = '300 30px Lato';
      ctx.fillText('Paper Balloons', 875, 600);

      ctx.restore();
    }

    if (menuIn.dwordFade < 1 && menuIn.progress > 2.5) {
      ctx.save();

      ctx.globalAlpha = menuIn.dwordFade;

      ctx.fillRect(680, 610, 195, 1);

      ctx.font = '300 15px Lato';
      ctx.fillText('Made by Luke Miller', 860, 870);

      ctx.font = '300 30px Lato';
      ctx.fillText('Start', 860, 660);

      ctx.restore();
      menuIn.dwordFade += dT * 0.5;
    } else if (menuIn.dwordFade >= 1 && menuIn.progress > 2.5) {
      menuIn.dwordFade = 1;
      ctx.save();

      ctx.fillRect(680, 610, 195, 1);

      ctx.font = '300 15px Lato';
      ctx.fillText('Made by Luke Miller', 860, 870);

      ctx.font = '300 30px Lato';
      ctx.fillText('Start', 860, 660);

      ctx.restore();
    }
    ctx.restore();

    ctx.restore();

    if (menuIn.fade > 0) {
      ctx.save();

      ctx.globalAlpha = menuIn.fade;
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
      menuIn.fade -= dT * 0.35;
    } else {
      menuIn.fade = 0;
    }

    if (menuIn.progress > 4.5) {
      menuIn.progress = 4.5;
      gamestate = 'menu';

      menu.balloons = menuIn.finalBalloons;
    } else {
      menuIn.progress += dT;
    }
  } else if (gamestate === 'menu') {

    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();

    // draw balloons
    var _b = undefined;
    var _pos6 = {
      x: 0,
      y: 0
    };
    for (var i = 0; i < menuIn.balloons.length; i++) {
      _b = menuIn.balloons[i];

      _pos6.x = _b.pos.x;
      _pos6.y = _b.finalPos.y;

      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(_pos6.x - 128 * _b.scale, _pos6.y - 128 * _b.scale);

      ctx.drawImage(balloon, 0, 0, 256 * _b.scale, 256 * _b.scale);

      ctx.restore();
    }
    if (menuIn.progress > 0.1) {
      for (var i = 0; i < menuIn.finalBalloons.length; i++) {
        _b = menuIn.finalBalloons[i];

        _pos6.x = _b.pos.x;
        if (_b.curY > _b.finalPos.y + _b.bounceUp && _b.dir === 1) {
          _b.dir = -1;
        } else if (_b.curY < _b.finalPos.y && _b.dir === -1) {
          _b.dir = 1;
        }

        _b.speed += dT * 0.5 * _b.scale * _b.dir;
        _b.curY += _b.speed;
        _pos6.y = _b.curY;

        ctx.save();

        ctx.fillStyle = '#FFF';
        ctx.translate(_pos6.x - 128 * _b.scale, _pos6.y - 128 * _b.scale);

        ctx.drawImage(balloon, 0, 0, 256 * _b.scale, 256 * _b.scale);

        ctx.restore();
      }
    }

    // text rendering
    ctx.save();

    ctx.fillStyle = '#000';
    ctx.fontWeight = 300;
    ctx.textAlign = 'right';

    ctx.font = '300 30px Lato';
    ctx.fillText('Paper Balloons', 875, 600);

    ctx.fillRect(680, 610, 195, 1);

    ctx.font = '300 15px Lato';
    ctx.fillText('Made by Luke Miller', 860, 870);

    ctx.font = '300 30px Lato';
    ctx.fillText('Start', 860, 660);
    var measure = ctx.measureText('Start').width;

    ctx.restore();

    ctx.restore();

    // check for mouse interactions
    if (mouse.x > offset.x + 860 - measure && mouse.x < offset.x + 860 && mouse.y > offset.y + 630 && mouse.y < offset.y + 660) {
      if (!mouse.clicked && menu.buttonActive) {
        gamestate = 'menuTransitionOUT';
        menuIn.progress = 0;
        menu.buttonActive = false;
      } else if (mouse.clicked && !menu.buttonActive) {
        menu.buttonActive = true;
      }
    }
  } else if (gamestate === 'menuTransitionOUT') {

    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();

    // draw balloons
    var _b2 = undefined;
    var _pos7 = {
      x: 0,
      y: 0
    };
    for (var i = 0; i < menuIn.balloons.length; i++) {
      _b2 = menuIn.balloons[i];

      _pos7.x = _b2.pos.x;
      _pos7.y = lerp3(_b2.finalPos.y, _b2.finalPos.y - 1000, _b2.finalPos.y - 1000, menuIn.progress);

      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(_pos7.x - 128 * _b2.scale, _pos7.y - 128 * _b2.scale);

      ctx.drawImage(balloon, 0, 0, 256 * _b2.scale, 256 * _b2.scale);

      ctx.restore();
    }
    for (var i = 0; i < menuIn.finalBalloons.length; i++) {
      _b2 = menuIn.finalBalloons[i];

      _pos7.x = _b2.pos.x;
      _pos7.y = lerp3(_b2.curY, _b2.finalPos.y - 30, _b2.finalPos.y - 400, menuIn.progress);

      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(_pos7.x - 128 * _b2.scale, _pos7.y - 128 * _b2.scale);

      ctx.drawImage(balloon, 0, 0, 256 * _b2.scale, 256 * _b2.scale);

      ctx.restore();
    }

    // text rendering
    ctx.save();

    ctx.fillStyle = '#000';
    ctx.fontWeight = 300;
    ctx.textAlign = 'right';

    ctx.font = '300 30px Lato';
    ctx.fillText('Paper Balloons', 875, 600);

    ctx.fillRect(680, 610, 195, 1);

    ctx.font = '300 15px Lato';
    ctx.fillText('Made by Luke Miller', 860, 870);

    ctx.font = '300 30px Lato';
    ctx.fillText('Start', 860, 660);

    ctx.restore();

    ctx.restore();

    ctx.save();

    ctx.globalAlpha = menuIn.fade;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    if (menuIn.fade < 1) {
      menuIn.fade += dT * 1.5;
    } else {
      menuIn.fade = 1;
    }

    if (menuIn.progress > 1) {
      menuIn.progress = 1;
      gamestate = 'gameTransitionIN';
      game.fade = 1;

      socket.emit('join', {});
    } else {
      menuIn.progress += dT;
    }
  } else if (gamestate === 'gameTransitionIN') {

    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    ctx.save();

    ctx.globalAlpha = game.fade;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    if (game.fade < 0) {

      game.fade = 0;
      gamestate = 'inGame';
    } else {
      game.fade -= dT;
    }
  } else if (gamestate === 'inGame') {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();

    // draw creatures
    if (creatures) {
      var keys = Object.keys(creatures);

      var cre = undefined;
      var _pos8 = {
        x: 0,
        y: 0
      };
      for (var i = 0; i < keys.length; i++) {
        cre = creatures[keys[i]];

        _pos8.x = lerp3(cre.position.c_x, cre.position.b_x, cre.position.current.x, creatureAlpha);
        _pos8.y = lerp3(cre.position.c_y, cre.position.b_y, cre.position.current.y, creatureAlpha);

        ctx.save();

        ctx.fillStyle = cre.color;

        var ang = Math.atan2(cre.position.direction.y, cre.position.direction.x) + Math.PI / 2;

        ctx.translate(_pos8.x - 12, _pos8.y - 12);
        ctx.rotate(ang);

        ctx.drawImage(airplane, 0, 0, 24, 24);

        ctx.restore();
      }

      if (creatureAlpha < 1) {
        creatureAlpha += 0.05;
      }
    } // end creature loop

    // draw players
    if (users) {
      var _keys = Object.keys(users);

      var ply = undefined;
      var _pos9 = {
        x: 0,
        y: 0
      };
      for (var i = 0; i < _keys.length; i++) {
        ply = users[_keys[i]];

        _pos9.x = lerp3(ply.position.c_x, ply.position.b_x, ply.position.current.x, userAlpha);
        _pos9.y = lerp3(ply.position.c_y, ply.position.b_y, ply.position.current.y, userAlpha);

        ctx.save();

        ctx.fillStyle = ply.color;

        ctx.translate(_pos9.x - 85, _pos9.y - 85);

        ctx.drawImage(balloon, 0, 0, 170, 170);

        ctx.restore();
      }

      if (userAlpha < 1) {
        userAlpha += 0.05;
      }
    } // end players loop

    // draw the exit button
    ctx.save();

    ctx.font = '30px Lato';
    ctx.fontWeight = 300;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText('Exit', 10, 35);
    var _measure = ctx.measureText('Exit').width;

    ctx.restore();

    // check for mouse interactions
    if (mouse.x > offset.x + 10 && mouse.x < offset.x + _measure + 10 && mouse.y > offset.y + 5 && mouse.y < offset.y + 32) {
      if (!mouse.clicked && game.buttonActive) {
        gamestate = 'gameTransitionOUT';
        game.buttonActive = false;
        game.progress = 0;
        socket.emit('leave', {});
      } else if (mouse.clicked && !game.buttonActive) {
        game.buttonActive = true;
      }
    }

    ctx.restore();
  } else if (gamestate === 'gameTransitionOUT') {

    ctx.save();

    ctx.globalAlpha = dT * 4;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    if (game.fade > 1) {

      game.fade = 1;
      gamestate = 'menuTransitionIN';

      menu.balloons = [];

      menuIn.balloons = [];
      menuIn.finalBalloons = [];

      // add balloons for the transition
      var _numB = Math.floor(Math.random() * 8 + 8);
      var _scale2 = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < _numB; i++) {

        var _pos10 = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000
        };
        var _final2 = {
          x: _pos10.x,
          y: -Math.random() * 1200 - 400
        };
        var _shift2 = {
          x: _pos10.x,
          y: _final2.y + Math.random() * 100 * _scale2
        };
        var _mid2 = {
          x: _pos10.x,
          y: Math.random() * 0.5 * (_final2.y + _pos10.y)
        };

        menuIn.balloons[i] = new Balloon(_pos10, _mid2, _final2, _shift2, (Math.random() * 25 + 25) * _scale2, _scale2);
        _scale2 += Math.random() * 0.1;
      }

      // add balloons for the menu
      _numB = Math.floor(Math.random() * 5 + 5);
      _scale2 = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < _numB; i++) {

        var _pos11 = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000
        };
        var _final3 = {
          x: _pos11.x,
          y: Math.random() * 400 + 100
        };
        var _shift3 = {
          x: _pos11.x,
          y: _final3.y + Math.random() * 100 * _scale2
        };
        var _mid3 = {
          x: _pos11.x,
          y: Math.random() * 0.5 * (_final3.y + _pos11.y)
        };

        menuIn.finalBalloons[i] = new Balloon(_pos11, _mid3, _final3, _shift3, (Math.random() * 25 + 25) * _scale2, _scale2);
        _scale2 += Math.random() * 0.1;
      }

      menuIn.progress = 0;
      menuIn.fade = 1;
      menuIn.wordFade = 0;
      menuIn.dwordFade = 0;
    } else {
      game.fade += dT;
    }
  }
  requestAnimationFrame(redrawBind);
};
