const xxh = require('xxhashjs');
const child = require('child_process');
const Player = require('./entities/Player.js');
const Creature = require('./entities/Creature.js');
const Message = require('./Message.js');

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

      // update the flocking process
      flocking.send(new Message('playerUpdate', m.data));

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
      io.sockets.in('main').emit('updateCreatures', m.data);

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


  // * MAIN FUNCTIONALITY * //

// main server function
const setupMain = (ioServer) => {
  io = ioServer;


  // create creatures and pass them to the flocking process
  const numCreatures = 40;
  const pos = {
    x: 0,
    y: 0,
  };
  for (let i = 0; i < numCreatures; i++) {
    const hash = xxh.h32(`${i}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    pos.x = Math.random() * 1500 - 300;
    pos.y = Math.random() * 1500 - 300;

    const cre = new Creature(hash, pos, `Creature#${i}`, '#FFFFFF', 'plane', 200, 200, 1);

    creatures[hash] = cre;
  }
  flocking.send(new Message('creatureList', creatures));


  // socket handling
  io.on('connection', (sock) => {
    const socket = sock;

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
    socket.hash = hash;

    // join handler
    socket.on('join', () => {
      socket.join('main');
      
      pos.x = Math.random() * 500 + 200;
      pos.y = Math.random() * 500 + 200;

      users[socket.hash] = 
        new Player(socket.hash, pos, socket.id, '#F00', 'balloon', 500, 25000, 1);

      // send other clients info on new player
      socket.broadcast.to('main').emit('addPlayer',
                         { hash: socket.hash, user: users[socket.hash] });

      // send child process info on new player
      physics.send(new Message('playerAdded', users[socket.hash]));
      flocking.send(new Message('playerAdded', users[socket.hash]));

      // send the new player back info ont the game
      socket.emit('joinedCreatures', new Message('creatures', creatures));
      socket.emit('joinedPlayers', new Message('users', users));

      console.log(`Player: ${socket.hash} has joined the server`);
    });


    // leave handler
    socket.on('leave', () => {
      if (users[socket.hash]) {
        physics.send(new Message('playerRemoved', socket.hash));
        flocking.send(new Message('playerRemoved', socket.hash));

        console.log(`Player: ${socket.hash} has left the room`);
        delete users[socket.hash];
        
        // tell other players
        socket.broadcast.to('main').emit('removePlayer',
                         { hash: socket.hash });

        socket.leave('main');
      }
    });


    // move handler
    socket.on('move', (data) => {
      if (users[socket.hash]) {
        users[socket.hash].movement = data;
        physics.send(new Message('playerMoved',
                    { hash: socket.hash, movement: users[socket.hash].movement }));
      }
    });


    // disconnect handler
    socket.on('disconnect', () => {
      if (users[socket.hash]) {
        physics.send(new Message('playerRemoved', socket.hash));
        flocking.send(new Message('playerRemoved', socket.hash));

        console.log(`Player: ${socket.hash} has left the server`);
        delete users[socket.hash];
        
        // tell other players
        socket.broadcast.to('main').emit('removePlayer',
                         { hash: socket.hash });

        socket.leave('main');
      }
    });
  });
};

module.exports = {
  setupMain,
};
