"use strict";

const app = app || { };

app.utils = {
  keyDownHandler: (e) => {
    var keyPressed = e.which;

    // W OR UP
    if(keyPressed === 87 || keyPressed === 38) {
      this.movement.up = true;
    }
    // A OR LEFT
    else if(keyPressed === 65 || keyPressed === 37) {
      this.movement.left = true;
    }
    // S OR DOWN
    else if(keyPressed === 83 || keyPressed === 40) {
      this.movement.down = true;
    }
    // D OR RIGHT
    else if(keyPressed === 68 || keyPressed === 39) {
      this.movement.right = true;
    }
    // SPACE
    else if(keyPressed === 32) {
      this.movement.space = true;
    }

    e.preventDefault();
  },

  keyUpHandler: (e) => {
    var keyPressed = e.which;

    // W OR UP
    if(keyPressed === 87 || keyPressed === 38) {
      this.movement.up = false;
    }
    // A OR LEFT
    else if(keyPressed === 65 || keyPressed === 37) {
      this.movement.left = false;
    }
    // S OR DOWN
    else if(keyPressed === 83 || keyPressed === 40) {
      this.movement.down = false;
    }
    // D OR RIGHT
    else if(keyPressed === 68 || keyPressed === 39) {
      this.movement.right = false;
    }
    // SPACE
    else if(keyPressed === 32) {
      this.movement.space = false;
    }     

    e.preventDefault();
  },
  
  fixScreenSize: () => {
    var canvas = document.querySelector('#mainCanvas');
    
    canvas.width = document.querySelector('body').innerWidth;
    canvas.height = document.querySelector('body').innerHeight;
  }
};