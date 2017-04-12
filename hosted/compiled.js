"use strict";

var app = app || {};

app.main = {
  // canvas drawing elements
  offCanvas: undefined,
  offCtx: undefined,
  canvas: undefined,
  ctx: undefined,

  // game data
  gamestate: 'ingame',

  // movement object for player
  movement: {
    down: false,
    up: false,
    right: false,
    left: false,
    space: false
  },

  // connection information
  socket: undefined,
  id: undefined,
  users: undefined,
  creatures: undefined,

  update: function update(data) {},

  updatePosition: function updatePosition() {},

  lerp3: function lerp3(v0, v1, v2, alpha) {
    return (1 - alpha) * ((1 - alpha) * v0 + alpha * v1) + ((1 - alpha) * v1 + v2 * alpha) * alpha;
  },

  redraw: function (_redraw) {
    function redraw(_x) {
      return _redraw.apply(this, arguments);
    }

    redraw.toString = function () {
      return _redraw.toString();
    };

    return redraw;
  }(function (time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var keys = Object.Keys(creatures);

    for (var i = 0; i < keys.length; i++) {}

    requestAnimationFrame(redraw.bind(undefined));
  }),

  init: function init() {
    undefined.canvas = document.querySelector("#canvas");
    undefined.ctx = canvas.getContext("2d");

    undefined.socket = io.connect();

    undefined.socket.on('joined', function (data) {
      return app.connection.joined();
    });
    undefined.socket.on('joinedCreatures', function (data) {
      return app.connection.joinedCreatures();
    });
    undefined.socket.on('joinedPlayers', function (data) {
      return app.connection.joinedPlayers();
    });

    undefined.socket.on('updateCreatures', function (data) {
      return app.connection.updateCreatures();
    });
    undefined.socket.on('updatePlayers', function (data) {
      return app.connection.updatePlayers();
    });

    undefined.socket.on('addPlayer', function (data) {
      return app.connection.addPlayer();
    });
    undefined.socket.on('addCreatures', function (data) {
      return app.connection.addCreatures();
    });

    undefined.socket.on('removePlayer', function (data) {
      return app.connection.removePlayer();
    });
    undefined.socket.on('removeCreatures', function (data) {
      return app.connection.removeCreatures();
    });

    document.body.addEventListener('keydown', function (e) {
      return app.utils.keyDownHanlder();
    });
    document.body.addEventListener('keyup', function (e) {
      return app.utils.keyUpHandler();
    });
  }

};

(window.onload = function () {
  app.main.init();
  app.utils.fixScreenSize();
})();
"use strict";

var app = app || {};

app.utils = {
  keyDownHandler: function keyDownHandler(e) {
    var keyPressed = e.which;

    // W OR UP
    if (keyPressed === 87 || keyPressed === 38) {
      undefined.movement.up = true;
    }
    // A OR LEFT
    else if (keyPressed === 65 || keyPressed === 37) {
        undefined.movement.left = true;
      }
      // S OR DOWN
      else if (keyPressed === 83 || keyPressed === 40) {
          undefined.movement.down = true;
        }
        // D OR RIGHT
        else if (keyPressed === 68 || keyPressed === 39) {
            undefined.movement.right = true;
          }
          // SPACE
          else if (keyPressed === 32) {
              undefined.movement.space = true;
            }

    e.preventDefault();
  },

  keyUpHandler: function keyUpHandler(e) {
    var keyPressed = e.which;

    // W OR UP
    if (keyPressed === 87 || keyPressed === 38) {
      undefined.movement.up = false;
    }
    // A OR LEFT
    else if (keyPressed === 65 || keyPressed === 37) {
        undefined.movement.left = false;
      }
      // S OR DOWN
      else if (keyPressed === 83 || keyPressed === 40) {
          undefined.movement.down = false;
        }
        // D OR RIGHT
        else if (keyPressed === 68 || keyPressed === 39) {
            undefined.movement.right = false;
          }
          // SPACE
          else if (keyPressed === 32) {
              undefined.movement.space = false;
            }

    e.preventDefault();
  },

  fixScreenSize: function fixScreenSize() {
    var canvas = document.querySelector('#mainCanvas');

    canvas.width = document.querySelector('body').innerWidth;
    canvas.height = document.querySelector('body').innerHeight;
  }
};
"use strict";

var app = app || {};

app.connection = {

  // handler to load level and the connected player
  // does not load other players or creature information
  joined: function joined(data) {
    if (data === undefined || data.user === undefined) return;

    // set the user
    undefined.id = data.id;
    undefined.users[undefined.id] = data.user;
  },

  // handler to load creatures in
  joinedCreatures: function joinedCreatures(data) {
    if (data === undefined || data.creatures === undefined) return;

    undefined.creatures = data.creatures;
  },

  // handler to load other players in
  joinedPlayers: function joinedPlayers(data) {},

  addPlayer: function addPlayer(data) {
    if (data === undefined) return;

    if (!undefined.users[data.id]) {
      undefined.users[data.id] = data.user;
    }
  },

  addCreatures: function addCreatures(data) {},

  removePlayer: function removePlayer(data) {
    if (undefined.users[data.id]) {
      delete undefined.users[data.id];
    }
  },

  removeCreatures: function removeCreatures(data) {},

  updateCreatures: function updateCreatures(data) {
    if (data === undefined || data.creatures === undefined) return;

    var keys = Object.keys(data.creatures);
    for (var i = 0; i < keys.length; i++) {
      var creature = data.creatures[keys[i]];
      undefined.creatures[creature.ID].physics = creature.physics;
    }
  },

  updatePlayers: function updatePlayers(data) {}

};
