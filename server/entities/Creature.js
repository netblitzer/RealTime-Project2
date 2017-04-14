class Creature {

  constructor(_hash, _startPos, _name, _color, _type, _maxSpeed, _maxForce, _mass) {
    this.hash = _hash;
    this.color = _color;
    this.type = _type;

    this.pos = _startPos;
    this.maxSpeed = _maxSpeed;
    this.maxForce = _maxForce;
    this.friction = 1;
    this.mass = _mass;
    this.viewRange = 10000;       // 100 pixels
    this.viewCone = 45;
    this.seperationRange = 900;   // 30 pixels
    this.wallAvoidDist = 150;
    this.weights = {
      cohesion: 0.3,
      separation: 8,
      alignment: 0.1,
      flee: 20,
      avoidance: 5,
      wander: 20,
      wanderRadius: 40,
      wanderOffset: 200,
    };

    this.position = {
      current: {
        x: _startPos.x,
        y: _startPos.y,
      },
      b_x: 0,
      b_y: 0,
      c_x: 0,
      c_y: 0,
      lastUpdate: 0,
      direction: {
        x: 0,
        y: 0,
      },
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
      x: 1,
      y: 0,
    };
    this.right = {
      x: 0,
      y: 1,
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
