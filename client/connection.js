"use strict";

const app = app || { };

app.connection = {
  
  // handler to load level and the connected player
    // does not load other players or creature information
  joined: (data) => {
    if (data === undefined || data.user === undefined) return;
    
      // set the user
    this.id = data.id;
    this.users[this.id] = data.user;
  },
  
  // handler to load creatures in
  joinedCreatures: (data) => {
    if (data === undefined || data.creatures === undefined) return;
    
    this.creatures = data.creatures;
  },
  
  // handler to load other players in
  joinedPlayers: (data) => {
    
  },
  
  
  
  addPlayer: (data) => {
    if (data === undefined) return;
    
    if (!this.users[data.id]) {
      this.users[data.id] = data.user;
    }
  },
  
  addCreatures: (data) => {
    
  },
  
  
  
  removePlayer: (data) => {
    if (this.users[data.id]) {
      delete this.users[data.id];
    }
  },
  
  removeCreatures: (data) => {
    
  },
  
  
  
  updateCreatures: (data) => {
    if (data === undefined || data.creatures === undefined) return;
    
    const keys = Object.keys(data.creatures);
    for(let i = 0; i < keys.length; i++) {
      var creature = data.creatures[keys[i]];
      this.creatures[creature.ID].physics = creature.physics;
    }
  },
  
  updatePlayers: (data) => {
    
  },
  
}