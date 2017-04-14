const Message = require('./Message.js');

let creatures = { };
const players = { };
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

      // add friction
        // if the velocity is small enough, flatten it
    if (Math.abs(cre.velocity.x) < 0.1 || isNaN(cre.velocity.x)) {
      cre.velocity.x = 0;
    } else {
      cre.forces.x -= cre.velocity.x * cre.friction;
    }

    if (Math.abs(cre.velocity.y) < 0.1 || isNaN(cre.velocity.y)) {
      cre.velocity.y = 0;
    } else {
      cre.forces.y -= cre.velocity.y * cre.friction;
    }

    const desiredVel = {
      x: 0,
      y: 0,
    };
    let magnitude;

      // add wandering
    const wanderPos = {
      x: (cre.direction.x * cre.weights.wanderOffset),
      y: (cre.direction.y * cre.weights.wanderOffset),
    };
    const ang = Math.random() * Math.PI * 2;
    wanderPos.x += Math.sin(ang) * cre.weights.wanderRadius;
    wanderPos.y += Math.cos(ang) * cre.weights.wanderRadius;

    desiredVel.x = wanderPos.x;
    desiredVel.y = wanderPos.y;

    magnitude = cre.maxSpeed / mag(desiredVel);

    desiredVel.x *= magnitude;
    desiredVel.y *= magnitude;

    cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.wander;
    cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.wander;

      // add flocking forces
    // player interactions (fleeing)
    const playerKeys = Object.keys(players);
    for (let j = 0; j < playerKeys.length; j++) {
      const ply = players[playerKeys[j]];

      const dist = sqDist(cre.position.current, ply.position.current);

      if (dist < cre.viewRange) {
        desiredVel.x = cre.position.current.x - ply.position.current.x;
        desiredVel.y = cre.position.current.y - ply.position.current.y;

        // magnitude = cre.maxSpeed / magSq(desiredVel);
        // desiredVel.x *= magnitude;
        // desiredVel.y *= magnitude;

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
    let distFactor = 0;

    for (let j = 0; j < keys.length; j++) {
      if (i !== j) {
        const oth = creatures[keys[j]];

        const dist = sqDist(cre.position.current, oth.position.current);

        if (dist < cre.viewRange) {
          // check to see if the other creature is in front
          posDiff.x = oth.position.current.x - cre.position.current.x;
          posDiff.y = oth.position.current.y - cre.position.current.y;

          const inFront = dot(cre.direction, posDiff);

          if (inFront > 1) {
            distFactor = 100 / dist;
            checked++;
            // seperation
            if (dist < cre.seperationRange) {
              cre.forces.x += (posDiff.x - cre.velocity.x) *
                cre.weights.separation * distFactor;
              cre.forces.y += (posDiff.y - cre.velocity.y) *
                cre.weights.separation * distFactor;
            }


            // alignment
            avgAlignment.x += oth.direction.x * distFactor;
            avgAlignment.y += oth.direction.y * distFactor;

            // cohesion
            avgPosition.x += oth.position.current.x * distFactor;
            avgPosition.y += oth.position.current.y * distFactor;
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

        // alignment
      desiredVel.x = avgAlignment.x;
      desiredVel.y = avgAlignment.y;

      magnitude = cre.maxSpeed / magSq(desiredVel);
      desiredVel.x *= magnitude;
      desiredVel.y *= magnitude;

      cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.alignment;
      cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.alignment;

        // cohesion
      desiredVel.x = avgPosition.x - cre.position.current.x;
      desiredVel.y = avgPosition.y - cre.position.current.y;

      cre.forces.x += (desiredVel.x - cre.velocity.x) * cre.weights.cohesion;
      cre.forces.y += (desiredVel.y - cre.velocity.y) * cre.weights.cohesion;
    }


      // avoid walls
    let dist;
    if (900 - cre.position.current.x < cre.wallAvoidDist) {
      // check if pointing towards the wall
      dist = cre.position.current.x - 900 + cre.wallAvoidDist;
      dist = dist / cre.wallAvoidDist;
      cre.forces.x += (-100) * cre.weights.avoidance * dist;
    } else if (cre.position.current.x < cre.wallAvoidDist) {
      // check if pointing towards the wall
      dist = cre.wallAvoidDist - cre.position.current.x;
      dist = dist / cre.wallAvoidDist;
      cre.forces.x += (100) * cre.weights.avoidance * dist;
    }

    if (900 - cre.position.current.y < cre.wallAvoidDist) {
      // check if pointing towards the wall
      dist = cre.position.current.y - 900 + cre.wallAvoidDist;
      dist = dist / cre.wallAvoidDist;
      cre.forces.y += (-100) * cre.weights.avoidance * dist;
    } else if (cre.position.current.y < cre.wallAvoidDist) {
      // check if pointing towards the wall
      dist = cre.wallAvoidDist - cre.position.current.y;
      dist = dist / cre.wallAvoidDist;
      cre.forces.y += (100) * cre.weights.avoidance * dist;
    }


    // limit the forces
    if (cre.forces.x !== 0 || cre.forces.y !== 0) {
      const forceMag = cre.maxForce / mag(cre.forces);
      cre.forces.x *= forceMag;
      cre.forces.y *= forceMag;
    }

    // * ACCELERATION * //

      // calculate acceleration
    cre.acceleration.x = cre.forces.x / cre.mass;
    cre.acceleration.y = cre.forces.y / cre.mass;

    // * VELOCITY * //

      // calculate velocity
    cre.velocity.x += cre.acceleration.x * dT;
    cre.velocity.y += cre.acceleration.y * dT;

    if (cre.velocity.x !== 0 || cre.velocity.y !== 0) {
      magnitude = mag(cre.velocity);
      if (magnitude > cre.maxSpeed) {
        magnitude = cre.maxSpeed / magnitude;
        cre.velocity.x *= magnitude;
        cre.velocity.y *= magnitude;
      }
    }


    if (cre.velocity.x !== 0 || cre.velocity.y !== 0) {
      magnitude = mag(cre.velocity);
      cre.direction = {
        x: cre.velocity.x / magnitude,
        y: cre.velocity.y / magnitude,
      };
      cre.right = {
        x: cre.direction.y,
        y: -cre.direction.x,
      };
      cre.position.direction = cre.direction;
    }
    // console.dir(cre.velocity);

    // * POSITION * //

      // update positions
    cre.position.c_x = cre.position.b_x;
    cre.position.c_y = cre.position.b_y;
    cre.position.b_x = cre.position.current.x;
    cre.position.b_y = cre.position.current.y;
    cre.position.current.x += cre.velocity.x * dT;
    cre.position.current.y += cre.velocity.y * dT;

    // temporary stopper
    // if (cre.position.current.x > 900 || cre.position.current.x < 0) {
    //  cre.velocity.x *= -1;
    //  cre.position.current.x += cre.velocity.x * dT;
    // }
    // if (cre.position.current.y > 900 || cre.position.current.y < 0) {
    //  cre.velocity.y *= -1;
    //  cre.position.current.y += cre.velocity.y * dT;
    // }

    // add the player's position data to the data to send back
    sendData[cre.hash] = cre.position;
  }

  process.send(new Message('creatureUpdate', sendData));
};

setInterval(() => {
  simulate();
}, 16);

process.on('message', (m) => {
  switch (m.type) {
    case 'playerUpdate': {
      const keys = Object.keys(m.data);
      for (let i = 0; i < keys.length; i++) {
        if (players[keys[i]]) {
          players[keys[i]].position = m.data[keys[i]];
        }
      }

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
    case 'playerAdded': {
      const ply = m.data;
      players[ply.hash] = ply;

      break;
    }
    case 'creatureRemoved': {
      const cre = m.data;
      if (creatures[cre.hash]) {
        delete creatures[cre.hash];
      }

      break;
    }
    case 'playerRemoved': {
      const userHash = m.data;
      if (players[userHash]) {
        delete creatures[userHash];
      }

      break;
    }
    default: {
      console.log('Flocking process: Error, can\'t recognize message type');
      console.log(m.type);
    }
  }
});
