
// handler to load level and the connected player
  // does not load other players or creature information
const joined = (m) => {
  if (m === undefined || m.user === undefined) return;

    // set the user
  hash = m.hash;
  users[hash] = m.user;
};
  
// handler to load creatures in
const joinedCreatures = (m) => {
  if (m === undefined || m.data === undefined) return;

  creatures = m.data;
};
  
// handler to load other players in
const joinedPlayers = (m) => {
  if (m === undefined) return;
  
  users = m.data;
};
  
  
  
const addPlayer = (m) => {
  if (m === undefined) return;

  if (!users[m.hash]) {
    users[m.hash] = m.user;
  }
};
  
const addCreatures = (m) => {
  if (m === undefined) return;


};
  
  
  
const removePlayer = (m) => {
  if (m === undefined) return;

  if (users[m.hash]) {
    delete users[m.hash];
  }
};
  
const removeCreatures = (m) => {
  if (m === undefined) return;


};
  
  
  
const updateCreatures = (m) => {
  if (m === undefined) return;

  const keys = Object.keys(m);
  for(let i = 0; i < keys.length; i++) {
    var cre = m[keys[i]];
    
    if (cre.lastUpdate < creatures[keys[i]].position.lastUpdate) {
      continue;
    }
    
    creatures[keys[i]].position = cre;
  }
  
  creatureAlpha = 0.1;
};
  
const updatePlayers = (m) => {
  if (m === undefined) return;

  const keys = Object.keys(m);
  for(let i = 0; i < keys.length; i++) {
    var ply = m[keys[i]];
    
    if (ply.lastUpdate < users[keys[i]].position.lastUpdate) {
      continue;
    }
    
    users[keys[i]].position = ply;
  }
  
  userAlpha = 0.1;
};