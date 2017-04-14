const Message = require('./Message.js');

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
      user.forces.y -= 300;
    }
    if (user.movement.down) {
      user.forces.y += 300;
    }
    if (user.movement.left) {
      user.forces.x -= 300;
    }
    if (user.movement.right) {
      user.forces.x += 300;
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


      // check collisions and add calculate physics
    for (let j = i + 1; j < dataKeys.length; j++) {
      const other = players[dataKeys[j]];


      let dx = (user.position.current.x - other.position.current.x);
      dx *= dx;
      let dy = (user.position.current.y - other.position.current.y);
      dy *= dy;
      const dist = dx + dy;

      if (dist < user.position.radius + other.position.radius) {
        user.position.colliding = true;
        other.position.colliding = true;

          // objects to use for collision calculation
        const obj1 = { };
        const obj2 = { };

          // calculate combined mass
        const combMass = user.mass + other.mass;

          // calculate mass scalars
        obj1.massScalar = (2 * other.mass) / combMass;
        obj2.massScalar = (2 * user.mass) / combMass;

          // calculate velocity differences
        obj1.velDiff = {
          x: user.velocity.x - other.velocity.x,
          y: user.velocity.y - other.velocity.y,
        };
        obj2.velDiff = {
          x: -obj1.velDiff.x,
          y: -obj1.velDiff.y,
        };

          // calculate position differences
        obj1.posDiff = {
          x: user.position.current.x - other.position.current.x,
          y: user.position.current.y - other.position.current.y,
        };
        obj2.posDiff = {
          x: -obj1.posDiff.x,
          y: -obj1.posDiff.y,
        };

          // calculate the dot products
        obj1.dot = ((obj1.velDiff.x * obj1.posDiff.x) + (obj1.velDiff.y * obj1.posDiff.y));
        obj2.dot = ((obj2.velDiff.x * obj2.posDiff.x) + (obj2.velDiff.y * obj2.posDiff.y));

          // calculate sqrMag
        dx = (obj1.posDiff.x * obj1.posDiff.x);
        dy = (obj1.posDiff.y * obj1.posDiff.y);
        obj1.sqrMag = dx + dy;

        dx = (obj2.posDiff.x * obj2.posDiff.x);
        dy = (obj2.posDiff.y * obj2.posDiff.y);
        obj2.sqrMag = dx + dy;

          // calculate final scaler
        obj1.scalar = (obj1.massScalar * obj1.dot) / obj1.sqrMag;
        obj2.scalar = (obj2.massScalar * obj2.dot) / obj2.sqrMag;

          // calculate changed velocities
            // I add a 10% increase fudge factor to make sure
            //  the objects don't stick inside each other
        obj1.newVel = {
          x: user.velocity.x - (obj1.scalar * obj1.posDiff.x * 1.1),
          y: user.velocity.y - (obj1.scalar * obj1.posDiff.y * 1.1),
        };
        obj2.newVel = {
          x: other.velocity.x - (obj2.scalar * obj2.posDiff.x * 1.1),
          y: other.velocity.y - (obj2.scalar * obj2.posDiff.y * 1.1),
        };

          // calculate directions
        obj1.dir = {
          x: (obj1.newVel.x < 0 ? -1 : 1),
          y: (obj1.newVel.y < 0 ? -1 : 1),
        };
        obj2.dir = {
          x: (obj2.newVel.x < 0 ? -1 : 1),
          y: (obj2.newVel.y < 0 ? -1 : 1),
        };

          // calculate forces required to change velocities
        let dvx = (obj1.newVel.x * obj1.newVel.x);
        let dvy = (obj1.newVel.y * obj1.newVel.y);
        obj1.df = {
          x: 0.5 * user.mass * dvx * obj1.dir.x,
          y: 0.5 * user.mass * dvy * obj1.dir.y,
        };
        dvx = (obj2.newVel.x * obj2.newVel.x);
        dvy = (obj2.newVel.y * obj2.newVel.y);
        obj2.df = {
          x: 0.5 * other.mass * dvx * obj2.dir.x,
          y: 0.5 * other.mass * dvy * obj2.dir.y,
        };

          // add forces

        user.velocity.x = obj1.newVel.x;
        user.velocity.y = obj1.newVel.y;

        other.velocity.x = obj2.newVel.x;
        other.velocity.y = obj2.newVel.y;
      }
    }

    // * ACCELERATION * //

      // calculate acceleration
    user.acceleration.x = user.forces.x / user.mass;
    user.acceleration.y = user.forces.y / user.mass;


    // * VELOCITY * //

      // calculate velocity
    user.velocity.x += user.acceleration.x * dT;
    user.velocity.y += user.acceleration.y * dT;

    let magnitude = Math.sqrt((user.velocity.x ** 2) + (user.velocity.y ** 2));
    if (magnitude > user.maxSpeed) {
      magnitude = user.maxSpeed / magnitude;
      user.velocity.x *= magnitude;
      user.velocity.y *= magnitude;
    }

    // * POSITION * //

      // update positions
    user.position.c_x = user.position.b_x;
    user.position.c_y = user.position.b_y;
    user.position.b_x = user.position.current.x;
    user.position.b_y = user.position.current.y;
    user.position.current.x += user.velocity.x * dT;
    user.position.current.y += user.velocity.y * dT;

    // temporary stopper
    if (user.position.current.x > 900 || user.position.current.x < 0) {
      user.velocity.x *= -1;
      user.position.current.x += user.velocity.x * dT;
    }
    if (user.position.current.y > 900 || user.position.current.y < 0) {
      user.velocity.y *= -1;
      user.position.current.y += user.velocity.y * dT;
    }

    // add the player's position data to the data to send back
    sendData[user.hash] = user.position;
  }

  process.send(new Message('playerUpdate', sendData));
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
      const userHash = m.data;
      if (players[userHash]) {
        delete players[userHash];
      }

      break;
    }
    default: {
      console.log('Physics process: Error, can\'t recognize message type');
      console.log(m.type);
    }
  }
});
