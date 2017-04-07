"use strict";

var directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7
};

var spriteSizes = {
  WIDTH: 61,
  HEIGHT: 121
};

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var redraw = function redraw(time) {

  socket.emit('movementUpdate', squares[hash].movement);

  ctx.clearRect(0, 0, 500, 500);

  var keys = Object.keys(squares);

  for (var i = 0; i < keys.length; i++) {

    var square = squares[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if (square.alpha < 1) square.alpha += 0.05;

    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    //console.log(square.movement);

    // if we are mid animation or moving in any direction
    if (square.frame > 0 || square.moveUp || square.moveDown || square.moveRight || square.moveLeft) {
      square.frameCount++;

      if (square.frameCount % 8 === 0) {
        if (square.frame < 7) {
          square.frame++;
        } else {
          square.frame = 0;
        }
      }
    }

    ctx.drawImage(walkImage, spriteSizes.WIDTH * square.frame, spriteSizes.HEIGHT * square.direction, spriteSizes.WIDTH, spriteSizes.HEIGHT, square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);

    ctx.strokeRect(square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var walkImage = void 0;
var slashImage = void 0;
//our websocket connection
var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var squares = {};

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.movement.left = true;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.movement.right = true;
    }
    // SPACE
    else if (keyPressed === 32) {
        square.movement.space = true;
      }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.movement.left = false;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.movement.right = false;
    }
    // SPACE
    else if (keyPressed === 32) {
        square.movement.space = false;
      }
};

var init = function init() {
  walkImage = document.querySelector('#walk');
  slashImage = document.querySelector('#slash');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('updatedMovement', update);
  socket.on('left', removeUser);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
"use strict";

var update = function update(data) {
  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {

    var sq = data[keys[i]];

    if (!squares[sq.hash]) {
      squares[sq.hash] = sq;
      return;
    }

    if (squares[sq.hash].lastUpdate >= sq.lastUpdate) {
      console.dir(squares[sq.hash].lastUpdate);
      //console.dir(sq.lastUpdate);
      return;
    }

    var square = squares[sq.hash];
    square.prevX = sq.prevX;
    square.prevY = sq.prevY;
    square.destX = sq.destX;
    square.destY = sq.destY;

    //square.movement = sq.movement;

    square.alpha = 0.05;
  }
};

var removeUser = function removeUser(data) {
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

var setUser = function setUser(data) {
  hash = data.hash;
  squares[hash] = data;
  requestAnimationFrame(redraw);
};
