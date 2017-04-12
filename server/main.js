const xxh = require('xxhashjs');
const child = require('child_process');
const Player = require('./entities/Player.js');
const Creature = require('./entities/Creature.js');

let io;

const users = { };
const creatures = { };

const physics = child.fork('./server/Physics.js');
const flocking = child.fork('./server/Flocking.js');


// * MESSAGE HANDLING * //

    // * PHYSICS * //

physics.on('error', (error) => {
  console.dir(error);
});

physics.on('close', (code, signal) => {
  console.log(`Child closed${signal}`);
});

physics.on('exit', (code, signal) => {
  console.log(`Child exited${signal}`);
});

physics.on('message', (m) => {
  switch (m.type) {
    case 'playerUpdate': {
      io.sockets.in('main').emit('updatePlayers', m.data);

      // update the server's information so we can send things to new players
      const keys = Object.keys(m.data);
      for (let i = 0; i < keys.length; i++) {
        if (users[keys[i]]) {
          users[keys[i]].position = m.data[keys[i]];
        }
      }

      break;
    }
    default: {
      console.log('Server process: Error, can\'t recognize message type from physics process');
    }
  }
});

    // * FLOCKING * //

flocking.on('error', (error) => {
  console.dir(error);
});

flocking.on('close', (code, signal) => {
  console.log(`Child closed${signal}`);
});

flocking.on('exit', (code, signal) => {
  console.log(`Child exited${signal}`);
});

flocking.on('message', (m) => {
  switch (m.type) {
    case 'creatureUpdate': {
      io.sockets.in('main').emit('updatePlayers', m.data);

      // update the server's information so we can send things to new players
      const keys = Object.keys(m.data);
      for (let i = 0; i < keys.length; i++) {
        if (creatures[keys[i]]) {
          creatures[keys[i]].position = m.data[keys[i]];
        }
      }

      break;
    }
    default: {
      console.log('Server process: Error, can\'t recognize message type from physics process');
    }
  }
});


const setupMain = (ioServer) => {
  io = ioServer;

  const numCreatures = 10;
  for (let i = 0; i < numCreatures; i++) {
    const hash = xxh.h32(`${i}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
    const cre = new Creature(hash, { x: 0, y: 0 }, `Creature#${i}`, '#FFFFFF', 'fish', 40, 400, 1);

    creatures[hash] = cre;
  }

  io.on('connection', (sock) => {
    const socket = sock;

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
    socket.hash = hash;

    users[hash] = new Player(hash, { x: 0, y: 0 }, socket.id, '#FFFFFF', 'shark', 50, 500, 1);

    socket.on('join', (data) => {
      socket.join('main');

      physics.send('message', { type: 'playerAdded', data: users[socket.hash] });
    });
  });
};

module.exports = {
  setupMain,
};
