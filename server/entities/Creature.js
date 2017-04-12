class Creature {

  constructor(_hash, _startPos, _name, _color, _type, _maxSpeed, _maxForce, _mass) {
    this.hash = _hash;
    this.color = _color;
    this.type = _type;

    this.pos = _startPos;
    this.maxSpeed = _maxSpeed;
    this.maxForce = _maxForce;
    this.friction = 0.5;
    this.mass = _mass;
    this.viewRange = 100;
    this.weights = {
      cohesion: 1,
      separation: 1,
      alignment: 1,
      flee: 3,
      avoidance: 10,
      wander: 1,
      wanderRadius: 10,
      wanderOffset: 20,
    };

    this.position = {
      current: {
        x: 0,
        y: 0,
      },
      b_x: 0,
      b_y: 0,
      c_x: 0,
      c_y: 0,
      lastUpdate: 0,
    };

    this.force = {
      x: 0,
      y: 0,
    };

    this.acceleration = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.direction = {
      x: 0,
      y: 0,
    };
  }

  setWeights(_co, _sep, _ali, _flee, _avo, _wan, _wanR, _wanO) {
    this.weights = {
      cohesion: _co,
      separation: _sep,
      alignment: _ali,
      flee: _flee,
      avoidance: _avo,
      wander: _wan,
      wanderRadius: _wanR,
      wanderOffset: _wanO,
    };
  }

}

module.exports = Creature;
