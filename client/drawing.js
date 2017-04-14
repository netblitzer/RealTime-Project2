// drawing variables
let offCanvas = undefined;
let offCtx = undefined;
let canvas = undefined;
let ctx = undefined;
let redrawBind = undefined;

// resources
let airplane = undefined;
let balloon = undefined;
const center = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};
class Balloon {
  constructor(_pos, _midPos, _finalPos, _shiftPos, _bounceUp, _scale) {
    this.pos = _pos;
    this.midPos = _midPos;
    this.finalPos = _finalPos;
    this.shiftPos = _shiftPos;
    this.scale = _scale;
    this.bounceUp = _bounceUp;
    this.dir = 1;
    this.curY = 0;
    this.speed = 0;
  }
}

// time info
let dT = 0;
let lastTime = new Date().getTime();

// * GAMESTATES * //
  // loading
  // loadTransitionOUT
  // menuTransitionIN
  // menu
  // menuTransitionOUT
  // gameTransitionIN
  // inGame
  // gameTransitionOUT

// variables for screen transitions
const load = {
  progress: 0,
  fade: 0,
};
const menuIn = {
  balloons: [],
  finalBalloons: [],
  fade: 0,
  wordFade: 0,
  dwordFade: 0,
  progress: 0,
};
const menu = {
  balloons: [],
  buttonActive: false,
};
const game = {
  fade: 0,
  buttonActive: false,
};

// draw loop
const redraw = function () {
  const time = new Date();
  const curTime = time.getTime();
  dT = (curTime - lastTime) / 1000;
  lastTime = curTime;
    
  var offset = {
    x: 0,
    y: 0,
  };
  if (center.width > 900) {
    offset.x = center.x - 450;
  }
  if (center.height > 900) {
    offset.y = center.y - 450;
  }

  
  // * DRAWING AND TRANSITIONS * //
  
  if (gamestate === 'loading') {
    
    ctx.save();
    
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
    
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#FFF';
    
    const pos = {
      x: Math.cos(load.progress) * 50,
      y: Math.sin(load.progress) * 50,
    };
    
    ctx.beginPath();
    ctx.arc(center.x - pos.x, center.y - pos.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(center.x + pos.x, center.y + pos.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    
    // draw the load text
    ctx.font = '15px Lato';
    ctx.fontWeight = 300;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillRect(center.x - 30, center.y - 15, 60, 30);
    ctx.fillStyle = '#000';
    ctx.fillText('Loading', center.x, center.y + 8);
    
    load.progress += dT * 5;
    if (load.progress > Math.PI) {
      load.progress -= Math.PI;
    }
    
  }
  else if (gamestate === 'loadTransitionOUT') {
    
    ctx.save();
    
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
    
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#FFF';
    
    const pos = {
      x: Math.cos(load.progress) * 50,
      y: Math.sin(load.progress) * 50,
    };
    
    ctx.beginPath();
    ctx.arc(center.x - pos.x, center.y - pos.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(center.x + pos.x, center.y + pos.y, 10, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    
    // draw the ready text
    ctx.font = '15px Lato';
    ctx.fontWeight = 300;
    ctx.textAlign = 'center'
    ctx.fillStyle = '#FFF';
    ctx.fillRect(center.x - 30, center.y - 15, 60, 30);
    ctx.fillStyle = '#000';
    ctx.fillText('Ready', center.x, center.y + 8);
    
    ctx.save();
    
    ctx.globalAlpha = load.fade;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
    
    load.progress += dT * 5;
    if (load.progress > Math.PI) {
      load.progress -= Math.PI;
    }
    load.fade += dT;
    if (load.fade > 1) {
      load.fade = 0;
      gamestate = 'menuTransitionIN';
      
      // add balloons for the transition
      let numB = Math.floor(Math.random() * 8 + 8);
      let scale = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < numB; i++) {
        
        const pos = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000,
        };
        const final = {
          x: pos.x,
          y: -Math.random() * 1200 - 400,
        };
        const shift = {
          x: pos.x,
          y: final.y + Math.random() * 100 * scale,
        };
        const mid = {
          x: pos.x,
          y: Math.random() * 0.5 * (final.y + pos.y),
        };
        
        menuIn.balloons[i] = new Balloon(pos, mid, final, shift, (Math.random() * 25 + 25) * scale, scale);
        scale += Math.random() * 0.1;
      }
      
      // add balloons for the menu
      numB = Math.floor(Math.random() * 5 + 5);
      scale = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < numB; i++) {
        
        const pos = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000,
        };
        const final = {
          x: pos.x,
          y: Math.random() * 400 + 100,
        };
        const shift = {
          x: pos.x,
          y: final.y + Math.random() * 100 * scale,
        };
        const mid = {
          x: pos.x,
          y: Math.random() * 0.5 * (final.y + pos.y),
        };
        
        menuIn.finalBalloons[i] = new Balloon(pos, mid, final, shift, (Math.random() * 25 + 25) * scale, scale);
        scale += Math.random() * 0.1;
      }
      
      menuIn.progress = 0;
      menuIn.fade = 1;
      menuIn.wordFade = 0;
      menuIn.dwordFade = 0;
    }
    
  }
  else if (gamestate === 'menuTransitionIN') {
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';
    
    ctx.beginPath();
    ctx.moveTo(offset.x, offset.y);
    ctx.lineTo(offset.x, offset.y + 900);
    ctx.lineTo(offset.x + 900, offset.y + 900);
    ctx.lineTo(offset.x + 900, offset.y);
    ctx.closePath();
    ctx.stroke();

    ctx.translate(offset.x, offset.y);
    
    // draw balloons
    let b = undefined;
    let pos = {
      x: 0,
      y: 0,
    };
    for (var i = 0; i < menuIn.balloons.length; i++) {
      b = menuIn.balloons[i];

      if (menuIn.progress < 2) {
        pos.x = b.pos.x;
        pos.y = lerp3(b.pos.y, b.finalPos.y, b.finalPos.y, menuIn.progress / 2);
      } else {
        pos.x = b.pos.x;
        pos.y = b.finalPos.y;
      }
      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(pos.x - 128 * b.scale, pos.y - 128 * b.scale);

      ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

      ctx.restore();
    }
    if (menuIn.progress > 0.1) {
      for (var i = 0; i < menuIn.finalBalloons.length; i++) {
        b = menuIn.finalBalloons[i];

        if (menuIn.progress < 2.1) {
          pos.x = b.pos.x;
          pos.y = lerp3(b.pos.y, b.finalPos.y, b.finalPos.y, (menuIn.progress - 0.1) / 2);
          b.curY = pos.y;
        }
        else {
          pos.x = b.pos.x;
          if (b.curY > b.finalPos.y + b.bounceUp && b.dir === 1) {
            b.dir = -1;
          } else if (b.curY < b.finalPos.y && b.dir === -1) {
            b.dir = 1;
          }
          
          b.speed += dT * 0.5 * b.scale * b.dir;
          b.curY += b.speed;
          pos.y = b.curY;
        }
        
        ctx.save();

        ctx.fillStyle = '#FFF';
        ctx.translate(pos.x - 128 * b.scale, pos.y - 128 * b.scale);

        ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

        ctx.restore();
      }
    }
    
    // text rendering
    ctx.save();
    
    ctx.fillStyle = '#000';
    ctx.fontWeight = 300;
    ctx.textAlign = 'right';
    if (menuIn.wordFade < 1 && menuIn.progress > 2) {
      ctx.save();
      
      ctx.globalAlpha = menuIn.wordFade;
      
      ctx.font = '300 30px Lato';
      ctx.fillText('Paper Balloons', 875, 600);
      
      ctx.restore();
      menuIn.wordFade += dT * 0.5;
    } else if (menuIn.wordFade >= 1 && menuIn.progress > 2){
      menuIn.wordFade = 1;
      ctx.save();
      
      ctx.font = '300 30px Lato';
      ctx.fillText('Paper Balloons', 875, 600);
      
      ctx.restore();
    }
    
    if (menuIn.dwordFade < 1 && menuIn.progress > 2.5) {
      ctx.save();
      
      ctx.globalAlpha = menuIn.dwordFade;
      
      ctx.fillRect(680, 610, 195, 1);
      
      ctx.font = '300 15px Lato';
      ctx.fillText('Made by Luke Miller', 860, 870);
      
      ctx.font = '300 30px Lato';
      ctx.fillText('Start', 860, 660);
      
      ctx.restore();
      menuIn.dwordFade += dT * 0.5;
    } else if (menuIn.dwordFade >= 1 && menuIn.progress > 2.5){
      menuIn.dwordFade = 1;
      ctx.save();
      
      ctx.fillRect(680, 610, 195, 1);
      
      ctx.font = '300 15px Lato';
      ctx.fillText('Made by Luke Miller', 860, 870);
      
      ctx.font = '300 30px Lato';
      ctx.fillText('Start', 860, 660);
      
      ctx.restore();
    }
    ctx.restore();
    
    ctx.restore();
    
    if (menuIn.fade > 0) {
      ctx.save();
      
      ctx.globalAlpha = menuIn.fade;
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.restore();
      menuIn.fade -= dT * 0.35;
    } else {
      menuIn.fade = 0;
    }
    
    if (menuIn.progress > 4.5) {
      menuIn.progress = 4.5;
      gamestate = 'menu';
      
      menu.balloons = menuIn.finalBalloons;
      
    } else {
      menuIn.progress += dT;
    }
    
  }
  else if (gamestate === 'menu') {
    
  ctx.save();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();
    
    // draw balloons
    let b = undefined;
    let pos = {
      x: 0,
      y: 0,
    };
    for (var i = 0; i < menuIn.balloons.length; i++) {
      b = menuIn.balloons[i];
      
      pos.x = b.pos.x;
      pos.y = b.finalPos.y;
      
      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(pos.x - 128 * b.scale, pos.y - 128 * b.scale);

      ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

      ctx.restore();
    }
    if (menuIn.progress > 0.1) {
      for (var i = 0; i < menuIn.finalBalloons.length; i++) {
        b = menuIn.finalBalloons[i];
        
        pos.x = b.pos.x;
        if (b.curY > b.finalPos.y + b.bounceUp && b.dir === 1) {
          b.dir = -1;
        } else if (b.curY < b.finalPos.y && b.dir === -1) {
          b.dir = 1;
        }

        b.speed += dT * 0.5 * b.scale * b.dir;
        b.curY += b.speed;
        pos.y = b.curY;
        
        ctx.save();

        ctx.fillStyle = '#FFF';
        ctx.translate(pos.x - 128 * b.scale, pos.y - 128 * b.scale);

        ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

        ctx.restore();
      }
    }
    
    // text rendering
  ctx.save();
    
    ctx.fillStyle = '#000';
    ctx.fontWeight = 300;
    ctx.textAlign = 'right';
      
    ctx.font = '300 30px Lato';
    ctx.fillText('Paper Balloons', 875, 600);
      
    ctx.fillRect(680, 610, 195, 1);
      
    ctx.font = '300 15px Lato';
    ctx.fillText('Made by Luke Miller', 860, 870);

    ctx.font = '300 30px Lato';
    ctx.fillText('Start', 860, 660);
    const measure = ctx.measureText('Start').width;
    
  ctx.restore();
    
  ctx.restore();
    
    // check for mouse interactions
    if (mouse.x > offset.x + 860 - measure && mouse.x < offset.x + 860 && mouse.y > offset.y + 630 && mouse.y < offset.y + 660) {
      if (!mouse.clicked && menu.buttonActive) {
        gamestate = 'menuTransitionOUT';
        menuIn.progress = 0;
        menu.buttonActive = false;
      } else if (mouse.clicked && !menu.buttonActive) {
        menu.buttonActive = true;
      }
    }
    
  }
  else if (gamestate === 'menuTransitionOUT') {
    
  ctx.save();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();
    
    // draw balloons
    let b = undefined;
    let pos = {
      x: 0,
      y: 0,
    };
    for (var i = 0; i < menuIn.balloons.length; i++) {
      b = menuIn.balloons[i];
      
      pos.x = b.pos.x;
      pos.y = lerp3(b.finalPos.y, b.finalPos.y - 1000, b.finalPos.y - 1000, menuIn.progress);
      
      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(pos.x - 128 * b.scale, pos.y - 128 * b.scale);

      ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

      ctx.restore();
    }
    for (var i = 0; i < menuIn.finalBalloons.length; i++) {
      b = menuIn.finalBalloons[i];

      pos.x = b.pos.x;
      pos.y = lerp3(b.curY, b.finalPos.y - 30, b.finalPos.y - 400, menuIn.progress);

      ctx.save();

      ctx.fillStyle = '#FFF';
      ctx.translate(pos.x - 128 * b.scale, pos.y - 128 * b.scale);

      ctx.drawImage(balloon, 0, 0, 256 * b.scale, 256 * b.scale);

      ctx.restore();
    }
    
    // text rendering
  ctx.save();
    
    ctx.fillStyle = '#000';
    ctx.fontWeight = 300;
    ctx.textAlign = 'right';
      
    ctx.font = '300 30px Lato';
    ctx.fillText('Paper Balloons', 875, 600);
      
    ctx.fillRect(680, 610, 195, 1);

    ctx.font = '300 15px Lato';
    ctx.fillText('Made by Luke Miller', 860, 870);

    ctx.font = '300 30px Lato';
    ctx.fillText('Start', 860, 660);
    
  ctx.restore();
    
  ctx.restore();
    
    ctx.save();

    ctx.globalAlpha = menuIn.fade;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    
    if (menuIn.fade < 1) {
      menuIn.fade += dT * 1.5;
    } else {
      menuIn.fade = 1;
    }
    
    if (menuIn.progress > 1) {
      menuIn.progress = 1;
      gamestate = 'gameTransitionIN';
      game.fade = 1;
  
      socket.emit('join', {});
    } else {
      menuIn.progress += dT;
    }
    
  }
  else if (gamestate === 'gameTransitionIN') {
    
  ctx.save();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();
    
  ctx.restore();    
    
    ctx.save();

    ctx.globalAlpha = game.fade;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    
    if (game.fade < 0) {
      
      game.fade = 0;
      gamestate = 'inGame';
      
    } else {
      game.fade -= dT;
    }
    
  }
  else if (gamestate === 'inGame') {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
  ctx.save();
    
    ctx.strokeStyle = '#000';

    ctx.translate(offset.x, offset.y);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 900);
    ctx.lineTo(900, 900);
    ctx.lineTo(900, 0);
    ctx.closePath();
    ctx.stroke();
    
    // draw creatures
    if (creatures) {
      let keys = Object.keys(creatures);

      let cre = undefined;
      let pos = {
        x: 0,
        y: 0,
      };
      for (var i = 0; i < keys.length; i++) {
        cre = creatures[keys[i]];

        pos.x = lerp3(cre.position.c_x, cre.position.b_x, cre.position.current.x, creatureAlpha);
        pos.y = lerp3(cre.position.c_y, cre.position.b_y, cre.position.current.y, creatureAlpha);

        ctx.save();
        
        ctx.fillStyle = cre.color;
        
        const ang = Math.atan2(cre.position.direction.y, cre.position.direction.x) + Math.PI / 2;
        
        ctx.translate(pos.x - 12, pos.y - 12);
        ctx.rotate(ang);
        
        ctx.drawImage(airplane, 0, 0, 24, 24);

        ctx.restore();
      }

      if (creatureAlpha < 1) {
        creatureAlpha += 0.05;
      }
    } // end creature loop

    // draw players
    if (users) {
      let keys = Object.keys(users);

      let ply = undefined;
      let pos = {
        x: 0,
        y: 0,
      };
      for (var i = 0; i < keys.length; i++) {
        ply = users[keys[i]];

        pos.x = lerp3(ply.position.c_x, ply.position.b_x, ply.position.current.x, userAlpha);
        pos.y = lerp3(ply.position.c_y, ply.position.b_y, ply.position.current.y, userAlpha);

        ctx.save();
        
        ctx.fillStyle = ply.color;
        
        ctx.translate(pos.x - 85, pos.y - 85);
        
        ctx.drawImage(balloon, 0, 0, 170, 170);

        ctx.restore();
      }

      if (userAlpha < 1) {
        userAlpha += 0.05;
      }
    } // end players loop
    
    // draw the exit button
    ctx.save();
    
    ctx.font = '30px Lato';
    ctx.fontWeight = 300;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText('Exit', 10, 35);
    const measure = ctx.measureText('Exit').width;
    
    ctx.restore();
    
    // check for mouse interactions
    if (mouse.x > offset.x + 10 && mouse.x < offset.x + measure + 10 && mouse.y > offset.y + 5 && mouse.y < offset.y + 32) {
      if (!mouse.clicked && game.buttonActive) {
        gamestate = 'gameTransitionOUT';
        game.buttonActive = false;
        game.progress = 0;
        socket.emit('leave', {});
      } else if (mouse.clicked && !game.buttonActive) {
        game.buttonActive = true;
      }
    }
    
  ctx.restore();
    
  }
  else if (gamestate === 'gameTransitionOUT') { 
    
    ctx.save();

    ctx.globalAlpha = dT * 4;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
    
    if (game.fade > 1) {
      
      game.fade = 1;
      gamestate = 'menuTransitionIN';
      
      menu.balloons = [];
      
      menuIn.balloons = [];
      menuIn.finalBalloons = [];
      
      // add balloons for the transition
      let numB = Math.floor(Math.random() * 8 + 8);
      let scale = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < numB; i++) {
        
        const pos = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000,
        };
        const final = {
          x: pos.x,
          y: -Math.random() * 1200 - 400,
        };
        const shift = {
          x: pos.x,
          y: final.y + Math.random() * 100 * scale,
        };
        const mid = {
          x: pos.x,
          y: Math.random() * 0.5 * (final.y + pos.y),
        };
        
        menuIn.balloons[i] = new Balloon(pos, mid, final, shift, (Math.random() * 25 + 25) * scale, scale);
        scale += Math.random() * 0.1;
      }
      
      // add balloons for the menu
      numB = Math.floor(Math.random() * 5 + 5);
      scale = 0.5 + Math.random() * 0.1;
      for (var i = 0; i < numB; i++) {
        
        const pos = {
          x: Math.random() * 900,
          y: Math.random() * 1200 + 2000,
        };
        const final = {
          x: pos.x,
          y: Math.random() * 400 + 100,
        };
        const shift = {
          x: pos.x,
          y: final.y + Math.random() * 100 * scale,
        };
        const mid = {
          x: pos.x,
          y: Math.random() * 0.5 * (final.y + pos.y),
        };
        
        menuIn.finalBalloons[i] = new Balloon(pos, mid, final, shift, (Math.random() * 25 + 25) * scale, scale);
        scale += Math.random() * 0.1;
      }
      
      menuIn.progress = 0;
      menuIn.fade = 1;
      menuIn.wordFade = 0;
      menuIn.dwordFade = 0;
      
    } else {
      game.fade += dT;
    }
    
  }
  requestAnimationFrame(redrawBind);
};
