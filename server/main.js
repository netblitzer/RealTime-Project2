const xxh = require('xxhashjs');
const child = require('child_process');

let io;

let users = { };

const physics = child.fork('./server/Physics.js');
const floacking = child.fork('./server/Flcoking.js');


const setupMain = (ioServer) => {
  io = ioServer;
  
  
  
  
};