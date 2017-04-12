
let players = { };
let dT = 0;
let lastTime = new Date().getTime();

  // simulates movement and physics
const simulate = () => {
    // update deltaTime
  const time = new Date();
  const curTime = time.getTime();
  dT = (curTime - lastTime) / 1000;
  lastTime = curTime;

  // object to store the data we'll send back to the server's main process
  const sendData = { };

    // get keys
  const dataKeys = Object.keys(players);

    // calculate physics
  for (let i = 0; i < dataKeys.length; i++) {
    const user = players[dataKeys[i]];
    user.acceleration = { x: 0, y: 0 };
    user.forces = { x: 0, y: 0 };
    user.position.lastUpdate = curTime;


    // * FORCES * //

      // add forces
    if (user.movement.up) {
      user.forces.y -= 1000;
    }
    if (user.movement.down) {
      user.forces.y += 1000;
    }
    if (user.movement.left) {
      user.forces.x -= 1000;
    }
    if (user.movement.right) {
      user.forces.x += 1000;
    }

      // add friction
        // if the velocity is small enough, flatten it
    if (Math.abs(user.velocity.x) < 0.1) {
      user.velocity.x = 0;
    } else {
      user.forces.x -= user.velocity.x * user.friction;
    }

    if (Math.abs(user.velocity.y) < 0.1) {
      user.velocity.y = 0;
    } else {
      user.forces.y -= user.velocity.y * user.friction;
    }


    // * ACCELERATION * //

      // calculate acceleration
    user.acceleration.x = user.forces.x / user.mass;
    user.acceleration.y = user.forces.y / user.mass;


    // * VELOCITY * //

      // calculate velocity
    user.velocity.x += user.acceleration.x * dT;
    user.velocity.y += user.acceleration.y * dT;


    // * POSITION * //

      // update positions
    user.position.c_x = user.position.b_x;
    user.position.c_y = user.position.b_y;
    user.position.b_x = user.position.current.x;
    user.position.b_y = user.position.current.y;
    user.position.current.x += user.velocity.x * dT;
    user.position.current.y += user.velocity.y * dT;

    // add the player's position data to the data to send back
    sendData[user.hash] = user.position;
  }

  process.send('message', { type: 'playerUpdate', data: sendData });
};

setInterval(() => {
  simulate();
}, 16);


process.on('message', (m) => {
  switch (m.type) {
    case 'playerList': {
      players = m.data;
      break;
    }
    case 'playerMoved': {
      if (players[m.data.hash]) {
        players[m.data.hash].movement = m.data.movement;
      }

      break;
    }
    case 'playerAdded': {
      const user = m.data;
      players[user.hash] = user;

      break;
    }
    case 'playerRemoved': {
      const user = m.data;
      if (players[user.hash]) {
        delete players[user.hash];
      }

      break;
    }
    default: {
      console.log('Physics process: Error, can\'t recognize message type');
    }
  }
});
