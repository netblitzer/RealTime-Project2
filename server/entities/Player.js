class Player {

  constructor(_hash, _startPos, _name, _color, _type, _maxSpeed, _maxForce, _mass) {
    this.hash = _hash;
    this.name = _name;
    this.color = _color;
    this.type = _type;

    this.pos = _startPos;
    this.maxSpeed = _maxSpeed;
    this.maxForce = _maxForce;
    this.friction = 0.5;
    this.mass = _mass;

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

    this.movement = {
      up: false,
      down: false,
      left: false,
      right: false,
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
  }

}

module.exports = Player;
