let creatures = { };
let players = { };
let lastTime = new Date().getTime();
let dT = 0;


// * VECTOR2 FUNCTIONS * //

const sqDist = (vec1, vec2) => {
  const x2 = (vec1.x - vec2.x) ** 2;
  const y2 = (vec1.y - vec2.y) ** 2;
  return x2 + y2;
};

const dot = (vec1, vec2) => {
  const a1 = vec1.x * vec2.x;
  const a2 = vec1.y * vec2.y;
  return a1 + a2;
};

const mag = (vec1) => {
  const x = vec1.x ** 2;
  const y = vec1.y ** 2;
  return Math.sqrt(x + y);
};
const magSq = (vec1) => {
  const x = vec1.x ** 2;
  const y = vec1.y ** 2;
  return (x + y);
};


const simulate = () => {
  // update deltaTime
  const time = new Date();
  const curTime = time.getTime();
  dT = (curTime - lastTime) / 1000;
  lastTime = curTime;

  // object to store the data we'll send back to the server's main process
  const sendData = { };

    // get keys
  const keys = Object.keys(creatures);

    // calculate physics
  for (let i = 0; i < keys.length; i++) {
    const cre = creatures[keys[i]];
    cre.acceleration = { x: 0, y: 0 };
    cre.forces = { x: 0, y: 0 };
    cre.position.lastUpdate = curTime;

    // * FORCES * //

      // add forces
    if (cre.movement.up) {
      cre.forces.y -= 1000;
    }
    if (cre.movement.down) {
      cre.forces.y += 1000;
    }
    if (cre.movement.left) {
      cre.forces.x -= 1000;
    }
    if (cre.movement.right) {
      cre.forces.x += 1000;
    }

      // add friction
        // if the velocity is small enough, flatten it
    if (Math.abs(cre.velocity.x) < 0.1) {
      cre.velocity.x = 0;
    } else {
      cre.forces.x -= cre.velocity.x * cre.friction;
    }

    if (Math.abs(cre.velocity.y) < 0.1) {
      cre.velocity.y = 0;
    } else {
      cre.forces.y -= cre.velocity.y * cre.friction;
    }

    const desiredVel = {
      x: 0,
      y: 0,
    };
    let magnitude;

      // add flocking forces
    // player interactions (fleeing)
    const playerKeys = Object.keys(players);
    for (let j = 0; j < playerKeys.length; j++) {
      const ply = players[playerKeys[j]];

      const dist = sqDist(cre.current, ply.current);

      if (dist < cre.viewRange) {
        desiredVel.x = cre.current.x - ply.current.x;
        desiredVel.y = cre.current.y - ply.current.y;

        magnitude = 1 / magSq(desiredVel);
        desiredVel.x *= magnitude * cre.maxSpeed;
        desiredVel.y *= magnitude * cre.maxSpeed;

        cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.flee;
        cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.flee;
      }
    }

    // creature to creature interactions

    const avgAlignment = {
      x: 0,
      y: 0,
    };
    const avgPosition = {
      x: 0,
      y: 0,
    };
    const avgSep = {
      x: 0,
      y: 0,
    };
    const posDiff = {
      x: 0,
      y: 0,
    };
    let checked = 0;

    for (let j = 0; j < keys; j++) {
      if (i !== j) {
        const oth = creatures[creatures[j]];

        const dist = sqDist(cre.current, oth.current);

        if (dist < cre.viewRange) {
          // check to see if the other creature is in front
          posDiff.x = oth.position.current.x - cre.position.current.x;
          posDiff.y = oth.position.current.y - cre.position.current.y;
          const inFront = dot(cre.direction, posDiff);

          if (inFront > 0.3) {
            checked++;
            // seperation
            if (dist < 50) {
              avgSep.x += posDiff.x;
              avgSep.y += posDiff.y;
            }

            // alignment
            avgAlignment.x += oth.direction.x;
            avgAlignment.y += oth.direction.y;

            // cohesion
            avgPosition.x += oth.position.current.x;
            avgPosition.y += oth.position.current.y;
          }
        } // end creature in range
      }
    } // end creature to creature checks

    if (checked > 0) {
      // calculate the final forces

      const numDiv = 1 / checked;
      avgAlignment.x *= numDiv;
      avgAlignment.y *= numDiv;
      avgPosition.x *= numDiv;
      avgPosition.y *= numDiv;
      avgSep.x *= numDiv;
      avgSep.y *= numDiv;

        // seperation
      desiredVel.x = cre.current.x - avgSep.x;
      desiredVel.y = cre.current.y - avgSep.y;

      cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.separation;
      cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.separation;

        // alignment
      desiredVel.x = avgAlignment.x;
      desiredVel.y = avgAlignment.y;

      magnitude = 1 / magSq(desiredVel);
      desiredVel.x *= magnitude * cre.maxSpeed;
      desiredVel.y *= magnitude * cre.maxSpeed;

      cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.alignment;
      cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.alignment;

        // cohesion
      cre.desiredVel.x = avgPosition.x - cre.current.x;
      cre.desiredVel.y = avgPosition.y - cre.current.y;

      cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.cohesion;
      cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.cohesion;
    }

    // limit the forces
    const forceMag = 1 / magSq(cre.forces) * cre.maxForce;
    cre.forces.x *= forceMag;
    cre.forces.y *= forceMag;

    // * ACCELERATION * //

      // calculate acceleration
    cre.acceleration.x = cre.forces.x / cre.mass;
    cre.acceleration.y = cre.forces.y / cre.mass;


    // * VELOCITY * //

      // calculate velocity
    cre.velocity.x += cre.acceleration.x * dT;
    cre.velocity.y += cre.acceleration.y * dT;

    magnitude = mag(cre.velocity);
    cre.direction = {
      x: cre.velocity.x / magnitude,
      y: cre.velocity.y / magnitude,
    };

    // * POSITION * //

      // update positions
    cre.position.c_x = cre.position.b_x;
    cre.position.c_y = cre.position.b_y;
    cre.position.b_x = cre.position.current.x;
    cre.position.b_y = cre.position.current.y;
    cre.position.current.x += cre.velocity.x * dT;
    cre.position.current.y += cre.velocity.y * dT;

    // add the player's position data to the data to send back
    sendData[cre.hash] = cre.position;
  }

  process.send('message', { type: 'creatureUpdate', data: sendData });
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
    case 'creatureList': {
      creatures = m.data;
      break;
    }
    case 'creatureAdded': {
      const cre = m.data;
      creatures[cre.hash] = cre;

      break;
    }
    case 'creatureRemoved': {
      const cre = m.data;
      if (creatures[cre.hash]) {
        delete creatures[cre.hash];
      }

      break;
    }
    default: {
      console.log('Flocking process: Error, can\'t recognize message type');
    }
  }
});
