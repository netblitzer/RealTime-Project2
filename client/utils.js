const mouse = {
  x: 0,
  y: 0,
  clicked: false,
};

const keyDownHandler = (e) => {
  var keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    movement.up = true;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    movement.left = true;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    movement.down = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    movement.right = true;
  }
  // SPACE
  else if(keyPressed === 32) {
    movement.space = true;
  }

  // tell the server of the update
  socket.emit('move', movement);

  e.preventDefault();
};

const keyUpHandler = (e) => {
  var keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    movement.up = false;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    movement.left = false;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    movement.down = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    movement.right = false;
  }
  // SPACE
  else if(keyPressed === 32) {
    movement.space = false;
  }     

  // tell the server of the update
  socket.emit('move', movement);

  e.preventDefault();
};

const fixScreenSize = () => {
  canvas.width = window.innerWidth;//document.querySelector('body').innerWidth;
  canvas.height = window.innerHeight;//document.querySelector('body').innerHeight;
  
  center.x = window.innerWidth / 2;
  center.y = window.innerHeight / 2;
  center.width = window.innerWidth;
  center.height = window.innerHeight;
};

const lerp3 = (v0, v1, v2, alpha) => {
  return (1 - alpha) * ((1 - alpha) * v0 + alpha * v1) + ((1 - alpha) * v1 + v2 * alpha) * alpha;
};

const getMouse = (e) => {
  mouse.x = e.pageX - e.target.offsetLeft;
  mouse.y = e.pageY - e.target.offsetTop;
};