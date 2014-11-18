(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-from-rect.coffee":[function(require,module,exports){
var toAABB;

module.exports = toAABB = function(rect) {
  var aabb;
  return aabb = {
    pos: {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    },
    half: {
      x: rect.width / 2,
      y: rect.height / 2
    }
  };
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-intersect-line.coffee":[function(require,module,exports){
var clamp, intersectSegment, sign;

clamp = require('./clamp');

sign = require('./sign');


/*
determine if a line segment intersects a bounding box
aabb is has pos, which is the center point of the bounding box and half, which is the radius of the box on each axis
pos is the x,y position of the start of the line segment
delta is the length of the line segment in 2 directions
 */

module.exports = intersectSegment = function(aabb, pos, delta, paddingX, paddingY) {
  var farTime, farTimeX, farTimeY, hit, nearTime, nearTimeX, nearTimeY, scaleX, scaleY, signX, signY;
  if (paddingX == null) {
    paddingX = 0;
  }
  if (paddingY == null) {
    paddingY = 0;
  }
  scaleX = 1.0 / delta.x;
  scaleY = 1.0 / delta.y;
  signX = sign(scaleX);
  signY = sign(scaleY);
  nearTimeX = (aabb.pos.x - signX * (aabb.half.x + paddingX) - pos.x) * scaleX;
  nearTimeY = (aabb.pos.y - signY * (aabb.half.y + paddingY) - pos.y) * scaleY;
  farTimeX = (aabb.pos.x + signX * (aabb.half.x + paddingX) - pos.x) * scaleX;
  farTimeY = (aabb.pos.y + signY * (aabb.half.y + paddingY) - pos.y) * scaleY;
  if (nearTimeX > farTimeY || nearTimeY > farTimeX) {
    return null;
  }
  nearTime = nearTimeX > nearTimeY ? nearTimeX : nearTimeY;
  farTime = farTimeX < farTimeY ? farTimeX : farTimeY;
  if (nearTime >= 1 || farTime <= 0) {
    return null;
  }

  /*
  hit.pos is the point of contact between the two objects (or an estimation of it, in some sweep tests).
  hit.normal is the surface normal at the point of contact.
  hit.delta is the overlap between the two objects, and is a vector that can be added to the colliding object’s position to move it back to a non-colliding state.
  hit.time is a fraction from 0 to 1 indicating how far along the line the collision occurred. (This is the t value for the line equation L(t) = A + t * (B - A))
   */
  hit = {
    collider: aabb,
    pos: {
      x: 0,
      y: 0
    },
    delta: {
      x: 0,
      y: 0
    },
    normal: {
      x: 0,
      y: 0
    },
    time: clamp(nearTime, 0, 1)
  };
  if (nearTimeX > nearTimeY) {
    hit.normal.x = -signX;
    hit.normal.y = 0;
  } else {
    hit.normal.x = 0;
    hit.normal.y = -signY;
  }
  hit.delta.x = hit.time * delta.x;
  hit.delta.y = hit.time * delta.y;
  hit.pos.x = pos.x + hit.delta.x;
  hit.pos.y = pos.y + hit.delta.y;
  return hit;
};



},{"./clamp":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/clamp.coffee","./sign":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/sign.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-intersect.coffee":[function(require,module,exports){
var intersectAABB, sign;

sign = require('./sign');


/*
This test uses a separating axis test, which checks for overlaps between the
two boxes on each axis. If either axis is not overlapping, the boxes aren’t
colliding.

The function returns a Hit object, or null if the two static boxes do not
overlap, and gives the axis of least overlap as the contact point. That is, it
sets hit.delta so that the colliding box will be pushed out of the nearest edge
This can cause weird behavior for moving boxes, so you should use sweepAABB
instead for moving boxes.
 */

module.exports = intersectAABB = function(aabb, aabb2) {
  var dx, dy, hit, px, py, sx, sy;
  dx = aabb2.pos.x - aabb.pos.x;
  px = (aabb2.half.x + aabb.half.x) - Math.abs(dx);
  if (px <= 0) {
    return null;
  }
  dy = aabb2.pos.y - aabb.pos.y;
  py = (aabb2.half.y + aabb.half.y) - Math.abs(dy);
  if (py <= 0) {
    return null;
  }

  /*
  hit.pos is the point of contact between the two objects (or an estimation of it, in some sweep tests).
  hit.normal is the surface normal at the point of contact.
  hit.delta is the overlap between the two objects, and is a vector that can be added to the colliding object’s position to move it back to a non-colliding state.
   */
  hit = {
    collider: aabb,
    pos: {
      x: 0,
      y: 0
    },
    delta: {
      x: 0,
      y: 0
    },
    normal: {
      x: 0,
      y: 0
    }
  };
  if (px < py) {
    sx = sign(dx);
    hit.delta.x = px * sx;
    hit.normal.x = sx;
    hit.pos.x = aabb.pos.x + (aabb.half.x * sx);
    hit.pos.y = aabb2.pos.y;
  } else {
    sy = sign(dy);
    hit.delta.y = py * sy;
    hit.normal.y = sy;
    hit.pos.x = aabb2.pos.x;
    hit.pos.y = aabb.pos.y + (aabb.half.y * sy);
  }
  return hit;
};



},{"./sign":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/sign.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-point-inside.coffee":[function(require,module,exports){
var pointInAABB;

module.exports = pointInAABB = function(point, box) {
  return (point.x > box.x) && (point.x < box.x + box.width) && (point.y > box.y) && (point.y < box.y + box.height);
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/ai.coffee":[function(require,module,exports){
var AiController, PathController, pathfinder;

pathfinder = require('./pathfinder');

PathController = (function() {
  function PathController(entity, tPoint) {
    this.entity = entity;
    this.tPoint = tPoint;
    this.njumps = 0;
    this.justJumped = false;
    this.njumpsNeeded = this.tPoint.njump;
    console.log(this.tPoint.dir);
  }

  PathController.prototype.step = function() {
    if (this.justJumped) {
      this.entity.jump = false;
    }
    if (!this.entity.jumping) {
      if (this.njumps < this.njumpsNeeded) {
        return this.makeJump();
      } else {
        if (this.tPoint.dir === "left") {
          return this.entity.left = true;
        } else if (this.tPoint.dir === "right") {
          return this.entity.right = true;
        }
      }
    }
  };

  PathController.prototype.makeJump = function() {
    this.entity.jump = true;
    this.justJumped = true;
    return this.njumps += 1;
  };

  return PathController;

})();

AiController = (function() {
  function AiController(entity1, entity2) {
    this.entity1 = entity1;
    this.entity2 = entity2;
    this.pgraph = pathfinder.getPlatformGraph();
    console.log('platform graph');
    console.log(this.pgraph);
    this.p1Index = null;
    this.p2Index = null;
    this.path = null;
    this.reachedTransitionPoint = false;
  }

  AiController.prototype.setNavigationOnPlatform = function() {
    if (this.entity2.x > this.entity1.x) {
      this.entity1.right = true;
      return this.entity1.left = false;
    } else {
      this.entity1.left = true;
      return this.entity1.right = false;
    }
  };

  AiController.prototype.toTransitionPoint = function(transX) {
    if (transX > this.entity1.x) {
      this.entity1.right = true;
      return this.entity1.left = false;
    } else if (transX < this.entity1.x) {
      this.entity1.left = true;
      return this.entity1.right = false;
    }
  };

  AiController.prototype.atTransitionPoint = function(transX) {
    return (this.entity1.x > transX - 3) && (this.entity1.x < transX + 3);
  };

  AiController.prototype.toNextPlatform = function(p1, p2) {
    if (!this.entity1.jump) {
      this.entity1.jump = true;
    } else {

    }
    return false;
  };

  AiController.prototype.setNavigationToPlatform = function() {
    var nextPlatform, thisPlatform, tp, transX;
    thisPlatform = this.path[0];
    nextPlatform = this.path[1];
    tp = this.pgraph.getTransitionPoint(thisPlatform.key(), nextPlatform.key());
    transX = tp.getXCoord();
    if (!this.reachedTransitionPoint) {
      if (this.atTransitionPoint(transX)) {
        this.entity1.x = transX;
        this.entity1.dx = 0;
        this.entity1.right = false;
        this.entity1.left = false;
        this.reachedTransitionPoint = true;
        console.log('new path controller!');
        return this.pController = new PathController(this.entity1, tp);
      } else {
        return this.toTransitionPoint(transX);
      }
    } else {
      return this.pController.step();
    }
  };

  AiController.prototype.step = function() {
    var p1Index, p2Index;
    p1Index = this.pgraph.getPlatformIndexForEntity(this.entity1);
    p2Index = this.pgraph.getPlatformIndexForEntity(this.entity2);
    if ((p1Index !== this.p1Index) || (p2Index !== this.p2Index)) {
      if (p1Index !== null && p2Index !== null) {
        console.log(p1Index, p2Index);
        this.path = pathfinder.findpath(this.entity1, this.entity2);
        this.reachedTransitionPoint = false;
        this.p1Index = p1Index;
        this.p2Index = p2Index;
      }
    }
    this.entity1.left = false;
    this.entity1.right = false;
    this.entity1.jump = false;
    if (this.path) {
      if (this.path.length === 1) {
        return this.setNavigationOnPlatform();
      } else {
        return this.setNavigationToPlatform();
      }
    }
  };

  return AiController;

})();

module.exports = AiController;



},{"./pathfinder":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/pathfinder.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/astar.coffee":[function(require,module,exports){
var AStar;

module.exports.Astar = AStar = (function() {
  function AStar() {
    this.openNodes = {};
    this.closedNodes = {};
    this.maxHeuristic = 100000;
  }

  AStar.prototype.findPath = function(start, destination) {
    var key, n, node, path, _i, _len, _ref, _ref1;
    start.f = this.heuristic(start, destination);
    this.openNodes[start.key()] = start;
    while (this.openNodes) {
      node = {
        f: Infinity
      };
      _ref = this.openNodes;
      for (key in _ref) {
        n = _ref[key];
        if (n.f < node.f) {
          node = n;
        }
      }
      if (node.f === Infinity) {
        return null;
      }
      if (node.equals(destination)) {
        path = [destination];
        while (node !== start) {
          node = this.closedNodes[node.parentKey];
          path.push(node);
        }
        path.reverse();
        return path;
      }
      delete this.openNodes[node.key()];
      this.closedNodes[node.key()] = node;
      _ref1 = node.getAdjacentNodes();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        n = _ref1[_i];
        if (!((!this.closedNodes[n.key()]) && (!this.openNodes[n.key()]))) {
          continue;
        }
        n.f = this.heuristic(n, destination);
        n.parentKey = node.key();
        if (n.f < this.maxHeuristic) {
          this.openNodes[n.key()] = n;
        }
      }
    }
  };

  AStar.prototype.heuristic = function(a, b) {
    return a.heuristicDistance(b);
  };

  return AStar;

})();



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/clamp.coffee":[function(require,module,exports){
module.exports = function(x, min, max) {
  return Math.max(min, Math.min(max, x));
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee":[function(require,module,exports){
var COLOR, FPS, TILE;

COLOR = {
  GREEN: '#33CC66',
  BLUE: '#0066CC',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  YELLOW: '#ECD078',
  BRICK: '#D95B43',
  HOT_PINK: '#FF3399',
  PINK: '#C02942',
  PURPLE: '#542437',
  GREY: '#333',
  SLATE: '#53777A',
  GOLD: 'gold',
  LBLUE: '#20BFF5'
};

TILE = 32;

FPS = 60;

module.exports = {
  TILE: TILE,
  METER: TILE,
  BTILE: 5,
  WTILE: 6,
  LTILE: 7,
  COLTILES: [1, 2, 3, 4, 5],
  GRAVITY: 9.8 * 6,
  MAXDX: 15,
  MAXDY: 60,
  ACCEL: 1 / 2,
  FRICTION: 1 / 6,
  IMPULSE: 1500,
  COLOR: COLOR,
  COLORS: [COLOR.YELLOW, COLOR.BRICK, COLOR.PINK, COLOR.PURPLE, COLOR.GREY, COLOR.LBLUE, COLOR.GREEN],
  KEY: {
    CTRL: 17,
    SPACE: 32,
    LEFT: 83,
    UP: 69,
    RIGHT: 70,
    DOWN: 68,
    GUNUP: 38,
    GUNDOWN: 40
  },
  STEP: 1 / FPS
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/entity.coffee":[function(require,module,exports){
var ControlMixin, Entity, RigidBody, assign, mixin, uuid;

ControlMixin = require('./mixin-local-control');

RigidBody = require('./mixin-rigid-body');

assign = require('lodash.assign');

mixin = require('lodash.mixin');

uuid = require('node-uuid');

Entity = (function() {
  function Entity(obj) {
    var control, rigid;
    this.id = uuid.v4();
    assign(this, obj);
    rigid = new RigidBody(obj);
    assign(this, rigid);
    mixin(this, rigid);
    control = new ControlMixin();
    assign(this, control);
    mixin(this, control);
  }

  Entity.prototype.step = function(level, dt) {
    return this.stepRigidBody(level, dt);
  };

  return Entity;

})();

module.exports = Entity;



},{"./mixin-local-control":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/mixin-local-control.coffee","./mixin-rigid-body":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/mixin-rigid-body.coffee","lodash.assign":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/index.js","lodash.mixin":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/index.js","node-uuid":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/node-uuid/uuid.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/level.coffee":[function(require,module,exports){
var Level, c;

c = require('./constants');

Level = (function() {
  function Level(obj) {
    this.cells = obj.layers[0].data;
    this.collision_cells = this.cells;
    this.image = new Image();
    this.objects = [];
    this.width = obj.width * c.TILE;
    this.height = obj.height * c.TILE;
    this.cols = obj.width;
    this.rows = obj.height;
  }

  Level.prototype.cellValue = function(x, y, type) {
    if (type == null) {
      type = 'render';
    }
    return this.tileToValue(this.pixelToTile(x), this.pixelToTile(y), type);
  };

  Level.prototype.pixelToTile = function(p) {
    return Math.floor(p / c.TILE);
  };

  Level.prototype.tileToPixel = function(t) {
    return t * c.TILE;
  };

  Level.prototype.tileToValue = function(tx, ty, type) {
    if (type == null) {
      type = 'render';
    }
    if (type === 'render') {
      return this.cells[tx + (ty * this.cols)];
    } else {
      return this.collision_cells[tx + (ty * this.rows)];
    }
  };

  Level.prototype.tileEntity = function(tx, ty) {
    var val;
    val = this.tileToValue(tx, ty);
    if (val) {
      return {
        type: "tile",
        value: val,
        x: tx * c.TILE,
        y: ty * c.TILE,
        width: c.TILE,
        height: c.TILE
      };
    }
  };

  return Level;

})();

module.exports = Level;



},{"./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/mixin-local-control.coffee":[function(require,module,exports){
var LocalControlMixin, c, events, screen, v2Sub, v2Unit, viewport;

c = require('./constants');

events = require('events');

screen = require('./screen');

v2Sub = require('./v2-subtract');

v2Unit = require('./v2-unit');

viewport = require('./viewport');

LocalControlMixin = (function() {
  function LocalControlMixin() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.emitter = new events.EventEmitter();
    this.aim = {
      x: 0,
      y: 0
    };
    this.cursorOffset = {
      x: 0,
      y: 0
    };
  }

  LocalControlMixin.prototype.getAimVector = function(event) {
    var aim, shoulder, target;
    target = {
      x: screen.toCanvas(event.clientX) + viewport.offset.x,
      y: screen.toCanvas(event.clientY) + viewport.offset.y
    };
    shoulder = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
    aim = v2Sub(target, shoulder);
    return v2Unit(aim);
  };

  LocalControlMixin.prototype.mouseDown = function(event) {
    return this.emitter.emit('fire', {
      x: this.aim.x,
      y: this.aim.y
    });
  };

  LocalControlMixin.prototype.mouseMove = function(event) {
    var aimX, aimY;
    this.aim = this.getAimVector(event);
    aimX = screen.toCanvas(event.clientX) + viewport.offset.x;
    aimY = screen.toCanvas(event.clientY) + viewport.offset.y;
    this.cursorOffset = {
      x: aimX - this.x,
      y: aimY - this.y
    };
    this.arm_angle = Math.atan2(this.aim.y, this.aim.x) * 180 / Math.PI;
    return this.emitter.emit('aim', {
      x: this.aim.x,
      y: this.aim.y
    });
  };

  LocalControlMixin.prototype.mouseUp = function() {};

  LocalControlMixin.prototype.on = function(event, listener) {
    return this.emitter.on(event, listener);
  };

  LocalControlMixin.prototype.onKey = function(ev, key, down) {
    switch (key) {
      case c.KEY.LEFT:
        ev.preventDefault();
        this.left = down;
        return false;
      case c.KEY.RIGHT:
        ev.preventDefault();
        this.right = down;
        return false;
      case c.KEY.UP:
        ev.preventDefault();
        this.up = down;
        return false;
      case c.KEY.DOWN:
        ev.preventDefault();
        this.down = down;
        return false;
      case c.KEY.SPACE || c.KEY.UP:
        ev.preventDefault();
        this.jump = down;
        if (down) {
          this.emitter.emit('jump');
        }
        return false;
      case c.KEY.TOGGLE_WEAPON:
        ev.preventDefault();
        if (down) {
          this.armed = !this.armed;
          if (this.armed) {
            this.emitter.emit('unholster');
          } else {
            this.emitter.emit('holster');
          }
        }
        return false;
    }
  };

  return LocalControlMixin;

})();

module.exports = LocalControlMixin;



},{"./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee","./screen":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/screen.coffee","./v2-subtract":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/v2-subtract.coffee","./v2-unit":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/v2-unit.coffee","./viewport":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/viewport.coffee","events":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/mixin-rigid-body.coffee":[function(require,module,exports){
var RigidBodyMixin, c, collide, move;

c = require('./constants');

collide = require('./physics-collide');

move = require('./physics-move');

RigidBodyMixin = (function() {
  function RigidBodyMixin(obj) {
    obj.properties = obj.properties || {};
    this.x = obj.x;
    this.y = obj.y;
    this.width = obj.width;
    this.height = obj.height;
    this.dx = 0;
    this.dy = 0;
    this.gravity = c.METER * (obj.properties.gravity || c.GRAVITY);
    this.maxdx = c.METER * (obj.properties.maxdx || c.MAXDX);
    this.maxdy = c.METER * (obj.properties.maxdy || c.MAXDY);
    this.impulse = c.METER * (obj.properties.impulse || c.IMPULSE);
    this.accel = this.maxdx / (obj.properties.accel || c.ACCEL);
    this.friction = this.maxdx / (obj.properties.friction || c.FRICTION);
    this.falling = false;
    this.jumping = false;
    this.onfloor = false;
    this.maxjumpcount = obj.maxjumpcount || 1;
    this.jumpcount = 0;
    this.left = obj.properties.left;
    this.right = obj.properties.right;
    this.jump = null;
    this.buoyancy = 0.95 * this.gravity;
    this.wImpulse = 0.5 * c.METER * (obj.properties.impulse || c.IMPULSE);
    this.inWater = false;
    this.wFriction = 2 * this.friction;
    this.wAccel = 0.5 * this.accel;
    this.wVelRescale = 0.1;
    this.onLadder = false;
    this.ladderdx = 120;
    this.ladderdy = 120;
  }

  RigidBodyMixin.prototype.stepRigidBody = function(level, dt) {
    var currentlyInWater, xnew, ynew;
    currentlyInWater = this._inWater(level);
    this.brokeWater = currentlyInWater && (!this.inWater);
    this.inWater = currentlyInWater;
    if (this._onLadder(level)) {
      if (!this.onLadder) {
        this.dy = 0;
        this.dx = 0;
      }
      this.onLadder = true;
    } else {
      this.onLadder = false;
    }
    xnew = move.stepX(this, level, dt);
    collide.levelCollideX(this, level, xnew);
    ynew = move.stepY(this, level, dt);
    return collide.levelCollideY(this, level, ynew);
  };

  RigidBodyMixin.prototype._inWater = function(level) {
    return level.cellValue(this.x + this.width / 2, this.y + this.height / 2) === c.WTILE;
  };

  RigidBodyMixin.prototype._onLadder = function(level) {
    var i, p, points, _i;
    points = [[this.x, this.y], [this.x + this.width, this.y], [this.x, this.y + this.height], [this.x + this.width, this.y + this.height]];
    for (i = _i = 0; _i <= 3; i = _i += 1) {
      p = points[i];
      if (level.cellValue(p[0], p[1]) === c.LTILE) {
        return true;
      }
    }
    return false;
  };

  return RigidBodyMixin;

})();

module.exports = RigidBodyMixin;



},{"./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee","./physics-collide":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-collide.coffee","./physics-move":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-move.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/pathfinder.coffee":[function(require,module,exports){
var PhysicsFinder, Platform, PlatformGraph, TransitionPoint, astar, c, canReachPlatform, pgraph, physics, _DIR_LEFT, _DIR_RIGHT, _TYPE_FALL, _TYPE_JUMP, _path,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

c = require('./constants');

astar = require('./astar');

_path = null;

pgraph = null;

physics = null;

module.exports.getPlatformGraph = function() {
  return pgraph;
};

module.exports.preProcess = function(level) {
  physics = new PhysicsFinder();
  return pgraph = new PlatformGraph(level);
};

PhysicsFinder = (function() {
  function PhysicsFinder() {
    this.xmax = 6;
    this.ymax = 9;
    this.ymaxSingle = this.ymax / 3;
  }

  return PhysicsFinder;

})();

module.exports.render = function(ctx) {
  var cx, cy, i, index, j, neighbors, platforms, seen, tp, tpoints, xt, yt, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
  ctx.save();
  ctx.font = "30px white Georgia";
  ctx.fillStyle = "white";
  platforms = pgraph.platforms;
  for (i = _i = 0, _ref = platforms.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
    xt = (platforms[i].xleft + platforms[i].xright) / 2;
    yt = platforms[i].y;
    ctx.fillText(i, xt * c.TILE, yt * c.TILE);
  }
  if (pgraph !== null) {
    tpoints = pgraph.transitionPoints;
    neighbors = pgraph.neighbors;
    for (i = _j = 0, _ref1 = tpoints.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      tp = tpoints[i];
      seen = {};
      for (j = _k = 0, _ref2 = tp.length - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
        if (tp[j] !== null) {
          xt = tp[j].tx;
          yt = platforms[i].y;
          if (tp[j].type === "fall") {
            ctx.fillStyle = '#ff0000';
          } else {
            ctx.fillStyle = '#00ff00';
          }
          cx = xt * c.TILE;
          cy = yt * c.TILE;
          index = cx + "," + cy;
          if (index in seen) {
            cy = cy + seen[index] * c.TILE;
            seen[index] = seen[index] + 1;
          } else {
            seen[index] = 1;
          }
          ctx.fillRect(cx, cy, 4, 4);
          ctx.fillText(pgraph.platforms[j].key(), cx, cy);
        }
      }
    }
  }
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 10;
  if (_path !== null && _path.length > 1) {
    ctx.beginPath();
    for (i = _l = 0, _ref3 = _path.length - 2; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; i = 0 <= _ref3 ? ++_l : --_l) {
      ctx.moveTo(_path[i].midx() * c.TILE, _path[i].y * c.TILE);
      ctx.lineTo(_path[i + 1].midx() * c.TILE, _path[i + 1].y * c.TILE);
    }
    ctx.stroke();
  }
  return ctx.restore();
};

Platform = (function() {
  function Platform(id, xleft, xright, y) {
    this.id = id;
    this.xleft = xleft;
    this.xright = xright;
    this.y = y;
  }

  Platform.prototype.overlap = function(xleft, xright) {
    return !(this.xright < xleft || this.xleft > xright);
  };

  Platform.prototype.xMax = function() {
    return [Math.max(0, this.xleft - physics.xmax), Math.max(0, this.xright + physics.xmax)];
  };

  Platform.prototype.midx = function() {
    return (this.xleft + this.xright) / 2;
  };

  Platform.prototype.xInPlatform = function(tx) {
    if (this.xleft < tx && this.xright > tx) {
      return true;
    }
    return false;
  };

  Platform.prototype.key = function() {
    return this.id;
  };

  Platform.prototype.getAdjacentNodes = function() {
    return pgraph.getNeighbors(this.id);
  };

  Platform.prototype.heuristicDistance = function(p2) {
    var dx, dy;
    dx = this.midx() - p2.midx();
    dy = this.y - p2.y;
    return dx * dx + dy * dy;
  };

  Platform.prototype.equals = function(p2) {
    return this.key() === p2.key();
  };

  return Platform;

})();

_TYPE_JUMP = "jump";

_TYPE_FALL = "fall";

_DIR_LEFT = "left";

_DIR_RIGHT = "right";

TransitionPoint = (function() {
  function TransitionPoint(type, dir, tx, p1, p2, njump) {
    this.type = type;
    this.dir = dir;
    this.tx = tx;
    this.p1 = p1;
    this.p2 = p2;
    this.njump = njump;
  }

  TransitionPoint.prototype.getXCoord = function() {
    return this.tx * c.TILE;
  };

  return TransitionPoint;

})();

canReachPlatform = function(p1, p2) {
  var leftx, rightx, _ref;
  _ref = p1.xMax(), leftx = _ref[0], rightx = _ref[1];
  if (p2.overlap(leftx, rightx)) {
    if (p2.y > p1.y) {
      return true;
    }
    if (p2.y + physics.ymax > p1.y) {
      return true;
    }
  }
  return false;
};

PlatformGraph = PlatformGraph = (function() {
  function PlatformGraph(level) {
    var i, j, neighbors, p1, p2, platforms, pneighs, _i, _j, _ref, _ref1;
    platforms = this._getAllPlatforms(level);
    neighbors = [];
    for (i = _i = 0, _ref = platforms.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      pneighs = [];
      p1 = platforms[i];
      for (j = _j = 0, _ref1 = platforms.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        if (i !== j) {
          p2 = platforms[j];
          if (canReachPlatform(p1, p2)) {
            pneighs.push(p2);
          }
        }
      }
      neighbors.push(pneighs);
    }
    this.platforms = platforms;
    this.neighbors = neighbors;
    this.transitionPoints = this._getTransitionPoints();
    console.log(this.neighbors);
    console.log(this.transitionPoints);
  }

  PlatformGraph.prototype.getTransitionPoint = function(k1, k2) {
    return this.transitionPoints[k1][k2];
  };

  PlatformGraph.prototype._getTransitionPoints = function() {
    var i, j, njumps, p1, p2, pdir, ptype, px, tp, transitionPoints, x, xleft, xright, _i, _j, _k, _l, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    transitionPoints = [];
    for (i = _i = 0, _ref = this.platforms.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      transitionPoints.push([]);
      for (j = _j = 0, _ref1 = this.platforms.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        transitionPoints[i].push(null);
      }
    }
    for (i = _k = 0, _ref2 = this.platforms.length - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
      p1 = this.platforms[i];
      tp = [];
      for (j = _l = 0, _ref3 = this.neighbors[i].length - 1; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; j = 0 <= _ref3 ? ++_l : --_l) {
        p2 = this.neighbors[i][j];
        if (p2.y > p1.y) {
          ptype = _TYPE_FALL;
          if (p2.xleft < p1.xleft || p2.xInPlatform(p1.xleft)) {
            pdir = _DIR_LEFT;
            px = p1.xleft;
          } else if (p2.xright > p1.xright || p2.xInPlatform(p1.xright)) {
            pdir = _DIR_RIGHT;
            px = p1.xright;
          } else {
            console.log("contained platform", p1.xleft, p1.xright, p2.xleft, p2.xright);
          }
        } else {
          ptype = _TYPE_JUMP;
          if (p1.y > p2.y + 2 * physics.ymaxSingle) {
            njumps = 3;
          } else if (p1.y > p2.y + physics.ymaxSingle) {
            njumps = 2;
          } else {
            njumps = 1;
          }
          if (p2.xleft > p1.xright) {
            pdir = _DIR_RIGHT;
            px = p1.xright;
          } else if (p2.xright < p1.xleft) {
            pdir = _DIR_LEFT;
            px = p1.xleft;
          } else {
            _ref4 = p2.xMax(), xleft = _ref4[0], xright = _ref4[1];
            console.log("jumping platform", xleft, xright, p2.xleft, p2.xright);
            if (p1.overlap(p2.xright, xright)) {
              pdir = _DIR_LEFT;
              for (x = _m = _ref5 = p2.xright + 2; _ref5 <= xright ? _m <= xright : _m >= xright; x = _ref5 <= xright ? ++_m : --_m) {
                if (p1.xInPlatform(x)) {
                  px = x;
                  break;
                }
              }
            }
            if (p1.overlap(xleft, p2.xleft)) {
              pdir = _DIR_RIGHT;
              for (x = _n = _ref6 = p2.xleft - 2; _n >= xleft; x = _n += -1) {
                if (p2.xInPlatform(x)) {
                  px = x;
                  break;
                }
              }
            }
          }
        }
        transitionPoints[p1.key()][p2.key()] = new TransitionPoint(ptype, pdir, px, p1, p2, njumps || null);
      }
    }
    console.log(transitionPoints);
    return transitionPoints;
  };

  PlatformGraph.prototype.getNeighbors = function(pnum) {
    return this.neighbors[pnum];
  };

  PlatformGraph.prototype._getAllPlatforms = function(level) {
    var col, platforms, row, t, xend, xstart, y, _i, _j, _ref, _ref1;
    platforms = [];
    xstart = null;
    y = null;
    for (row = _i = 0, _ref = level.rows - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
      for (col = _j = 0, _ref1 = level.cols - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; col = 0 <= _ref1 ? ++_j : --_j) {
        t = level.tileToValue(col, row);
        if (__indexOf.call(c.COLTILES, t) >= 0 && t !== c.BTILE) {
          if (xstart === null) {
            xstart = col;
            y = row;
          }
        } else {
          if (xstart !== null) {
            xend = col - 1;
            platforms.push(new Platform(platforms.length, xstart, xend, y));
            xstart = null;
          }
        }
      }
      if (xstart !== null) {
        xend = level.cols - 1;
        platforms.push(new Platform(platforms.length, xstart, xend, y));
        xstart = null;
      }
    }
    return platforms;
  };

  PlatformGraph.prototype.getPlatformIndexForEntity = function(entity) {
    var p, pnum, tx, ty, _i, _ref;
    if (!entity.onfloor) {
      return null;
    }
    ty = entity.ytile;
    tx = Math.floor((entity.x + entity.render_width / 2) / c.TILE);
    for (pnum = _i = 0, _ref = this.platforms.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; pnum = 0 <= _ref ? ++_i : --_i) {
      p = this.platforms[pnum];
      if (p.y === ty) {
        if (tx >= p.xleft && tx <= p.xright) {
          return pnum;
        }
      }
    }
    return null;
  };

  return PlatformGraph;

})();

module.exports.findpath = function(entity1, entity2) {
  var a, pnum1, pnum2;
  pnum1 = pgraph.getPlatformIndexForEntity(entity1);
  pnum2 = pgraph.getPlatformIndexForEntity(entity2);
  if ((pnum1 === null) || (pnum2 === null)) {
    return null;
  }
  a = new astar.Astar;
  _path = a.findPath(pgraph.platforms[pnum1], pgraph.platforms[pnum2]);
  return _path;
};



},{"./astar":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/astar.coffee","./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-bullet.coffee":[function(require,module,exports){
var c, findNearestCollision, inAABB, intersectLine, toAABB;

c = require('./constants');

intersectLine = require('./aabb-intersect-line');

inAABB = require('./aabb-point-inside');

toAABB = require('./aabb-from-rect');

findNearestCollision = function(minX, maxX, minY, maxY, pos, delta, entities, level) {
  var aabb, aabbs, ent, hit, nearestHit, nearestTime, x, y, _i, _j, _k, _l, _len, _len1;
  aabbs = [];
  for (y = _i = minY; minY <= maxY ? _i <= maxY : _i >= maxY; y = minY <= maxY ? ++_i : --_i) {
    for (x = _j = minX; minX <= maxX ? _j <= maxX : _j >= maxX; x = minX <= maxX ? ++_j : --_j) {
      if (level.tileToValue(x, y, 'collision')) {
        aabb = {
          pos: {
            x: (x * c.TILE) + c.TILE / 2,
            y: (y * c.TILE) + c.TILE / 2
          },
          half: {
            x: c.TILE / 2,
            y: c.TILE / 2
          }
        };
        aabb.type = 'tile';
        aabbs.push(aabb);
      }
    }
  }
  for (_k = 0, _len = entities.length; _k < _len; _k++) {
    ent = entities[_k];
    aabb = toAABB(ent);
    aabb.type = 'entity';
    aabb.entity = ent;
    aabbs.push(aabb);
  }
  nearestTime = 1;
  nearestHit = null;
  for (_l = 0, _len1 = aabbs.length; _l < _len1; _l++) {
    aabb = aabbs[_l];
    hit = intersectLine(aabb, pos, delta);
    if (hit && hit.time < nearestTime) {
      hit.type = aabb.type;
      hit.entity = aabb.entity;
      nearestTime = hit.time;
      nearestHit = hit;
    }
  }
  return nearestHit;
};

module.exports.step = function(bullet, entities, level, dt) {
  var collision, delta, maxX, maxY, minX, minY, pos;
  minX = Math.floor(bullet.x / c.TILE);
  maxX = Math.floor((bullet.x + bullet.dx * dt) / c.TILE);
  minY = Math.floor(bullet.y / c.TILE);
  maxY = Math.floor((bullet.y + bullet.dy * dt) / c.TILE);
  pos = {
    x: bullet.x,
    y: bullet.y
  };
  delta = {
    x: bullet.dx * dt,
    y: bullet.dy * dt
  };
  collision = findNearestCollision(minX, maxX, minY, maxY, pos, delta, entities, level);
  bullet.x += bullet.dx * dt;
  bullet.y += bullet.dy * dt;
  return collision;
};

module.exports.updateGun = function(gun, dt) {
  if (gun.up) {
    gun.angle -= gun.sensitivity * dt;
  }
  if (gun.down) {
    gun.angle += gun.sensitivity * dt;
  }
  if (gun.angle < 0) {
    return gun.angle = 0.001;
  } else if (gun.angle > Math.PI / 2) {
    return gun.angle = Math.PI / 2;
  }
};



},{"./aabb-from-rect":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-from-rect.coffee","./aabb-intersect-line":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-intersect-line.coffee","./aabb-point-inside":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-point-inside.coffee","./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-collide.coffee":[function(require,module,exports){
var c, intersectAABB, toAABB,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

intersectAABB = require('./aabb-intersect');

toAABB = require('./aabb-from-rect');

c = require('./constants');

module.exports.levelCollideX = function(entity, level, xnew) {
  var tentity, xold, xtilenew, xtileold, yold, ytile, ytilebottom, ytiletop, _i, _ref, _results;
  xold = entity.x;
  yold = entity.y;
  entity.x = xnew;
  if (xnew > xold) {
    xtileold = level.pixelToTile(xold + entity.width - 1);
    xtilenew = level.pixelToTile(xnew + entity.width - 1);
  } else if (xnew < xold) {
    xtileold = level.pixelToTile(xold);
    xtilenew = level.pixelToTile(xnew);
  } else {
    xtileold = xtilenew = null;
  }
  if (xtileold !== xtilenew) {
    ytiletop = level.pixelToTile(yold);
    ytilebottom = level.pixelToTile(yold + entity.height - 1);
    _results = [];
    for (ytile = _i = ytilebottom; ytilebottom <= ytiletop ? _i <= ytiletop : _i >= ytiletop; ytile = ytilebottom <= ytiletop ? ++_i : --_i) {
      tentity = level.tileEntity(xtilenew, ytile);
      if (tentity && (_ref = tentity.value, __indexOf.call(c.COLTILES, _ref) >= 0)) {
        entity.dx = 0;
        entity.ddx = 0;
        if (xnew > xold) {
          _results.push(entity.x = tentity.x - entity.width);
        } else {
          _results.push(entity.x = tentity.x + tentity.width);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
};

module.exports.levelCollideY = function(entity, level, ynew) {
  var tentity, xold, xtile, xtileleft, xtileright, yold, ytilenew, ytileold, _i, _ref, _results;
  xold = entity.x;
  yold = entity.y;
  entity.y = ynew;
  if (ynew < yold) {
    ytileold = level.pixelToTile(yold);
    ytilenew = level.pixelToTile(ynew);
  } else if (ynew > yold && entity.falling) {
    ytileold = level.pixelToTile(yold + entity.height - 1);
    ytilenew = level.pixelToTile(ynew + entity.height - 1);
  } else {
    ytileold = ytilenew = null;
  }
  if (ytileold !== ytilenew) {
    xtileleft = level.pixelToTile(xold);
    xtileright = level.pixelToTile(xold + entity.width - 1);
    _results = [];
    for (xtile = _i = xtileleft; xtileleft <= xtileright ? _i <= xtileright : _i >= xtileright; xtile = xtileleft <= xtileright ? ++_i : --_i) {
      tentity = level.tileEntity(xtile, ytilenew);
      if (tentity && (_ref = tentity.value, __indexOf.call(c.COLTILES, _ref) >= 0)) {
        entity.dy = 0;
        entity.ddy = 0;
        if (ynew < yold) {
          entity.y = tentity.y + tentity.height;
        } else {
          entity.y = tentity.y - entity.height;
          entity.onfloor = true;
          entity.ytile = ytilenew;
          entity.jumpcount = 0;
        }
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
};

module.exports.entityCollide = function(entity1, entity2) {
  if (intersectAABB(toAABB(entity1), toAABB(entity2))) {
    if (entity1.dx > 0) {
      return entity1.dx = -500;
    } else if (entity1.dx < 0) {
      return entity1.dx = 500;
    }
  }
};



},{"./aabb-from-rect":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-from-rect.coffee","./aabb-intersect":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/aabb-intersect.coffee","./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-move.coffee":[function(require,module,exports){
var c, clamp;

c = require('./constants');

clamp = require('./clamp');

module.exports.stepX = function(entity, level, dt) {
  var accel, friction, wasleft, wasright;
  wasleft = entity.dx < 0;
  wasright = entity.dx > 0;
  friction = (entity.falling ? 0.5 : 1) * (entity.inWater ? entity.wFriction : entity.friction);
  accel = (entity.falling ? 0.5 : 1) * (entity.inWater ? entity.wAccel : entity.accel);
  entity.ddx = 0;
  if (entity.onLadder) {
    entity.dx = 0;
    if (entity.left) {
      entity.dx = -entity.ladderdx;
    }
    if (entity.right) {
      entity.dx = entity.ladderdx;
    }
  } else {
    if (entity.left) {
      entity.ddx = entity.ddx - accel;
    } else if (wasleft) {
      entity.ddx = entity.ddx + friction;
    }
    if (entity.right) {
      entity.ddx = entity.ddx + accel;
    } else if (wasright) {
      entity.ddx = entity.ddx - friction;
    }
  }
  entity.dx = clamp(entity.dx + (entity.ddx * dt), -entity.maxdx, entity.maxdx);
  if ((wasleft && (entity.dx > 0)) || (wasright && (entity.dx < 0))) {
    entity.dx = 0;
  }
  return entity.x + Math.round(entity.dx * dt);
};

module.exports.stepY = function(entity, level, dt) {
  entity.ddy = 0;
  if (entity.onLadder) {
    entity.dy = 0;
    if (entity.up) {
      entity.dy = -entity.ladderdy;
    }
    if (entity.down) {
      entity.dy = entity.ladderdy;
    }
  } else {
    entity.ddy = entity.gravity;
  }
  if (entity.inWater) {
    if (entity.brokeWater) {
      entity.dy = entity.wVelRescale * entity.dy;
    }
    entity.ddy = entity.ddy - entity.buoyancy;
  }
  if (entity.jump && !entity.jumping && !entity.onLadder && (entity.onfloor || (entity.jumpcount < entity.maxjumpcount))) {
    entity.dy = 0;
    if (entity.inWater) {
      entity.ddy = entity.ddy - entity.wImpulse;
    } else {
      entity.ddy = entity.ddy - entity.impulse;
    }
    entity.jumping = true;
    entity.falling = false;
    entity.onfloor = false;
    entity.jumpcount++;
  }
  entity.dy = clamp(entity.dy + (entity.ddy * dt), -entity.maxdy, entity.maxdy);
  if (entity.dy > 0) {
    entity.jumping = false;
    entity.falling = true;
  }
  return entity.y + Math.round(entity.dy * dt);
};



},{"./clamp":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/clamp.coffee","./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/renderer.coffee":[function(require,module,exports){
var c, drawAngle, pathfinder, renderLevel;

c = require('./constants');

pathfinder = require('./pathfinder');

renderLevel = function(ctx, level) {
  var cell, x, y, _i, _ref, _results;
  _results = [];
  for (y = _i = 0, _ref = level.rows - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
    _results.push((function() {
      var _j, _ref1, _results1;
      _results1 = [];
      for (x = _j = 0, _ref1 = level.cols - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        cell = level.tileToValue(x, y);
        if (cell) {
          ctx.fillStyle = c.COLORS[cell - 1];
          ctx.fillRect(x * c.TILE, y * c.TILE, c.TILE, c.TILE);
          _results1.push(ctx.fillStyle = c.COLOR.WHITE);
        } else {
          _results1.push(void 0);
        }
      }
      return _results1;
    })());
  }
  return _results;
};

drawAngle = function(ctx, sprite) {
  var hheight, hwidth;
  if (!sprite) {
    return;
  }
  ctx.save();
  if (sprite.angle) {
    hwidth = sprite.width / 2;
    hheight = sprite.height / 2;
    ctx.translate(sprite.x + hwidth, sprite.y + hheight);
    ctx.rotate(sprite.angle);
    ctx.fillRect(-hwidth, -hheight, sprite.width, sprite.height);
  }
  return ctx.restore();
};

module.exports = function(ctx, me, enemies, gun, bullet, level) {
  var entity, gunx, guny, _i, _j, _len, _len1;
  ctx.clearRect(0, 0, level.width, level.height);
  renderLevel(ctx, level);
  ctx.fillStyle = c.COLOR.BLUE;
  ctx.fillRect(me.x - me.xoff, me.y - me.yoff, me.render_width, me.render_height);
  for (_i = 0, _len = enemies.length; _i < _len; _i++) {
    entity = enemies[_i];
    ctx.fillRect(entity.x - entity.xoff, entity.y - entity.yoff, entity.render_width, entity.render_height);
  }
  ctx.fillStyle = c.COLOR.YELLOW;
  ctx.fillRect(me.x, me.y, me.width, me.height);
  for (_j = 0, _len1 = enemies.length; _j < _len1; _j++) {
    entity = enemies[_j];
    ctx.fillStyle = c.COLOR.WHITE;
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
  }
  gunx = me.x + me.width / 2 + Math.sin(gun.angle) * 50;
  guny = me.y + me.height / 2 - Math.cos(gun.angle) * 50;
  ctx.fillRect(gunx - 2, guny - 2, 4, 4);
  drawAngle(ctx, bullet);
  return pathfinder.render(ctx);
};



},{"./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee","./pathfinder":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/pathfinder.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/screen.coffee":[function(require,module,exports){
module.exports.ratio = window.devicePixelRatio || 1;

module.exports.scale_factor = 1;

module.exports.toCanvas = function(screenX) {
  return screenX * (module.exports.ratio / module.exports.scale_factor);
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/sign.coffee":[function(require,module,exports){
var sign;

module.exports = sign = function(value) {
  if (value < 0) {
    return -1;
  } else {
    return 1;
  }
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/time.coffee":[function(require,module,exports){
module.exports = function() {
  if ((typeof window !== "undefined" && window !== null) && window.performance && window.performance.now) {
    return window.performance.now();
  } else {
    return new Date().getTime();
  }
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/v2-subtract.coffee":[function(require,module,exports){
var subtract;

module.exports = subtract = function(v2_a, v2_b) {
  var v;
  return v = {
    x: v2_a.x - v2_b.x,
    y: v2_a.y - v2_b.y
  };
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/v2-unit.coffee":[function(require,module,exports){
var unitVector;

module.exports = unitVector = function(v) {
  var dist;
  dist = Math.sqrt((v.x * v.x) + (v.y * v.y));
  return {
    x: v.x / dist,
    y: v.y / dist
  };
};



},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/viewport.coffee":[function(require,module,exports){
var Viewport, c, screen;

c = require('./constants');

screen = require('./screen');

Viewport = (function() {
  function Viewport() {
    this.offset = {
      x: 0,
      y: 0
    };
  }

  Viewport.prototype.setScreenSize = function(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.screenTilesW = Math.ceil(this.screenWidth / c.TILE);
    return this.screenTilesH = Math.ceil(this.screenHeight / c.TILE);
  };

  Viewport.prototype.followObject = function(x, y, level) {
    var col, row;
    if (!y) {
      y = 0;
    }
    if (!x) {
      x = 0;
    }
    col = x / c.TILE;
    row = y / c.TILE;
    this.startCol = col - (this.screenTilesW / 2);
    this.startRow = row - (this.screenTilesH / 2);
    if (this.startCol < 0) {
      this.startCol = 0;
    } else if (this.startCol + this.screenTilesW > level.width) {
      this.startCol = level.width - this.screenTilesW;
    }
    if (this.startRow < 0) {
      this.startRow = 0;
    } else if (this.startRow + this.screenTilesH > level.height) {
      this.startRow = level.height - this.screenTilesH;
    }
    if (this.startRow < 0) {
      this.startRow = 0;
    }
    if (this.startCol < 0) {
      this.startCol = 0;
    }
    return this.offset = {
      x: this.startCol * c.TILE,
      y: this.startRow * c.TILE
    };
  };

  Viewport.prototype.resize = function(canvas) {
    var ch, ctx, cw;
    canvas.width = window.innerWidth * screen.ratio;
    canvas.height = window.innerHeight * screen.ratio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    cw = screen.toCanvas(window.innerWidth);
    ch = screen.toCanvas(window.innerHeight);
    this.setScreenSize(cw, ch);
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    return ctx.scale(screen.scale_factor, screen.scale_factor);
  };

  return Viewport;

})();

module.exports = new Viewport();



},{"./constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee","./screen":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/screen.coffee"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources will overwrite property assignments of previous
 * sources. If a callback is provided it will be executed to produce the
 * assigned values. The callback is bound to `thisArg` and invoked with two
 * arguments; (objectValue, sourceValue).
 *
 * @static
 * @memberOf _
 * @type Function
 * @alias extend
 * @category Objects
 * @param {Object} object The destination object.
 * @param {...Object} [source] The source objects.
 * @param {Function} [callback] The function to customize assigning values.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns the destination object.
 * @example
 *
 * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
 * // => { 'name': 'fred', 'employer': 'slate' }
 *
 * var defaults = _.partialRight(_.assign, function(a, b) {
 *   return typeof a == 'undefined' ? b : a;
 * });
 *
 * var object = { 'name': 'barney' };
 * defaults(object, { 'name': 'fred', 'employer': 'slate' });
 * // => { 'name': 'barney', 'employer': 'slate' }
 */
var assign = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable) return result;
  var args = arguments,
      argsIndex = 0,
      argsLength = typeof guard == 'number' ? 2 : args.length;
  if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
    var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
  } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
    callback = args[--argsLength];
  }
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
    }
    }
  }
  return result
};

module.exports = assign;

},{"lodash._basecreatecallback":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js","lodash._objecttypes":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js","lodash.keys":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js","lodash.bind":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js","lodash.identity":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js","lodash.support":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    noop = require('lodash.noop');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = isNative(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._isnative":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js","lodash.noop":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js","lodash._slice":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push,
    unshift = arrayRef.unshift;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    // clone `bindData`
    bindData = slice(bindData);
    if (bindData[2]) {
      bindData[2] = slice(bindData[2]);
    }
    if (bindData[3]) {
      bindData[3] = slice(bindData[3]);
    }
    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js","lodash._basecreatewrapper":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js","lodash._slice":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js","lodash.isfunction":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      // avoid `arguments` object deoptimizations by using `slice` instead
      // of `Array.prototype.slice.call` and not assigning `arguments` to a
      // variable as a ternary expression
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js","lodash._setbinddata":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js","lodash._slice":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js","lodash.isobject":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    noop = require('lodash.noop');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js","lodash.isobject":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js","lodash.noop":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash.noop/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash.noop/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash._basecreate/index.js","lodash._setbinddata":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js","lodash._slice":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js","lodash.isobject":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash._basecreate/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._isnative":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._isnative/index.js","lodash._shimkeys":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js","lodash.isobject":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forEach = require('lodash.foreach'),
    functions = require('lodash.functions'),
    isFunction = require('lodash.isfunction'),
    isObject = require('lodash.isobject');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * Adds function properties of a source object to the destination object.
 * If `object` is a function methods will be added to its prototype as well.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {Function|Object} [object=lodash] object The destination object.
 * @param {Object} source The object of functions to add.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
 * @example
 *
 * function capitalize(string) {
 *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
 * }
 *
 * _.mixin({ 'capitalize': capitalize });
 * _.capitalize('fred');
 * // => 'Fred'
 *
 * _('fred').capitalize().value();
 * // => 'Fred'
 *
 * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
 * _('fred').capitalize();
 * // => 'Fred'
 */
function mixin(object, source, options) {
  var chain = true,
      methodNames = source && functions(source);

  if (options === false) {
    chain = false;
  } else if (isObject(options) && 'chain' in options) {
    chain = options.chain;
  }
  var ctor = object,
      isFunc = isFunction(ctor);

  forEach(methodNames, function(methodName) {
    var func = object[methodName] = source[methodName];
    if (isFunc) {
      ctor.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            value = this.__wrapped__,
            args = [value];

        push.apply(args, arguments);
        var result = func.apply(object, args);
        if (chain || chainAll) {
          if (value === result && isObject(result)) {
            return this;
          }
          result = new ctor(result);
          result.__chain__ = chainAll;
        }
        return result;
      };
    }
  });
}

module.exports = mixin;

},{"lodash.foreach":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/index.js","lodash.functions":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/index.js","lodash.isfunction":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.isfunction/index.js","lodash.isobject":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    forOwn = require('lodash.forown');

/**
 * Iterates over elements of a collection, executing the callback for each
 * element. The callback is bound to `thisArg` and invoked with three arguments;
 * (value, index|key, collection). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * Note: As with other "Collections" methods, objects with a `length` property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
 * // => logs each number and returns '1,2,3'
 *
 * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
 * // => logs each number and returns the object (property order is not guaranteed across environments)
 */
function forEach(collection, callback, thisArg) {
  var index = -1,
      length = collection ? collection.length : 0;

  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
  if (typeof length == 'number') {
    while (++index < length) {
      if (callback(collection[index], index, collection) === false) {
        break;
      }
    }
  } else {
    forOwn(collection, callback);
  }
  return collection;
}

module.exports = forEach;

},{"lodash._basecreatecallback":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash._basecreatecallback/index.js","lodash.forown":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash._basecreatecallback/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own enumerable properties of an object, executing the callback
 * for each property. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, key, object). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
 *   console.log(key);
 * });
 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
 */
var forOwn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forOwn;

},{"lodash._basecreatecallback":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash._basecreatecallback/index.js","lodash._objecttypes":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js","lodash.keys":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash.keys/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash.keys/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forIn = require('lodash.forin'),
    isFunction = require('lodash.isfunction');

/**
 * Creates a sorted array of property names of all enumerable properties,
 * own and inherited, of `object` that have function values.
 *
 * @static
 * @memberOf _
 * @alias methods
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names that have function values.
 * @example
 *
 * _.functions(_);
 * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
 */
function functions(object) {
  var result = [];
  forIn(object, function(value, key) {
    if (isFunction(value)) {
      result.push(key);
    }
  });
  return result.sort();
}

module.exports = functions;

},{"lodash.forin":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/node_modules/lodash.forin/index.js","lodash.isfunction":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.isfunction/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/node_modules/lodash.forin/index.js":[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own and inherited enumerable properties of an object,
 * executing the callback for each property. The callback is bound to `thisArg`
 * and invoked with three arguments; (value, key, object). Callbacks may exit
 * iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * Shape.prototype.move = function(x, y) {
 *   this.x += x;
 *   this.y += y;
 * };
 *
 * _.forIn(new Shape, function(value, key) {
 *   console.log(key);
 * });
 * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
 */
var forIn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    for (index in iterable) {
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forIn;

},{"lodash._basecreatecallback":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/node_modules/lodash.forin/node_modules/lodash._basecreatecallback/index.js","lodash._objecttypes":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/node_modules/lodash.forin/node_modules/lodash._objecttypes/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/node_modules/lodash.forin/node_modules/lodash._basecreatecallback/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash._basecreatecallback/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash._basecreatecallback/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash._basecreatecallback/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.functions/node_modules/lodash.forin/node_modules/lodash._objecttypes/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.foreach/node_modules/lodash.forown/node_modules/lodash._objecttypes/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.isfunction/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/node_modules/lodash.isobject/index.js":[function(require,module,exports){
module.exports=require("/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js")
},{"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/node-uuid/uuid.js":[function(require,module,exports){
(function (Buffer){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(require) == 'function') {
    try {
      var _rb = require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

}).call(this,require("buffer").Buffer)
},{"buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js","crypto":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/raf/index.js":[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/raf/node_modules/performance-now/lib/performance-now.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/raf/node_modules/performance-now/lib/performance-now.js":[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,require('_process'))
},{"_process":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/browser-resolve/empty.js":[function(require,module,exports){

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","ieee754":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","is-array":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js":[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js":[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/create-hash.js":[function(require,module,exports){
(function (Buffer){
var createHash = require('sha.js')

var md5 = toConstructor(require('./md5'))
var rmd160 = toConstructor(require('ripemd160'))

function toConstructor (fn) {
  return function () {
    var buffers = []
    var m= {
      update: function (data, enc) {
        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
        buffers.push(data)
        return this
      },
      digest: function (enc) {
        var buf = Buffer.concat(buffers)
        var r = fn(buf)
        buffers = null
        return enc ? r.toString(enc) : r
      }
    }
    return m
  }
}

module.exports = function (alg) {
  if('md5' === alg) return new md5()
  if('rmd160' === alg) return new rmd160()
  return createHash(alg)
}

}).call(this,require("buffer").Buffer)
},{"./md5":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/md5.js","buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js","ripemd160":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/ripemd160/lib/ripemd160.js","sha.js":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/create-hmac.js":[function(require,module,exports){
(function (Buffer){
var createHash = require('./create-hash')

var zeroBuffer = new Buffer(128)
zeroBuffer.fill(0)

module.exports = Hmac

function Hmac (alg, key) {
  if(!(this instanceof Hmac)) return new Hmac(alg, key)
  this._opad = opad
  this._alg = alg

  var blocksize = (alg === 'sha512') ? 128 : 64

  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

  if(key.length > blocksize) {
    key = createHash(alg).update(key).digest()
  } else if(key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize)
  }

  var ipad = this._ipad = new Buffer(blocksize)
  var opad = this._opad = new Buffer(blocksize)

  for(var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  this._hash = createHash(alg).update(ipad)
}

Hmac.prototype.update = function (data, enc) {
  this._hash.update(data, enc)
  return this
}

Hmac.prototype.digest = function (enc) {
  var h = this._hash.digest()
  return createHash(this._alg).update(this._opad).update(h).digest(enc)
}


}).call(this,require("buffer").Buffer)
},{"./create-hash":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/create-hash.js","buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/helpers.js":[function(require,module,exports){
(function (Buffer){
var intSize = 4;
var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize));
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = new Buffer(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

}).call(this,require("buffer").Buffer)
},{"buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/index.js":[function(require,module,exports){
(function (Buffer){
var rng = require('./rng')

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = require('./create-hash')

exports.createHmac = require('./create-hmac')

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)))
    } catch (err) { callback(err) }
  } else {
    return new Buffer(rng(size))
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

exports.getHashes = function () {
  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
}

var p = require('./pbkdf2')(exports)
exports.pbkdf2 = p.pbkdf2
exports.pbkdf2Sync = p.pbkdf2Sync


// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

}).call(this,require("buffer").Buffer)
},{"./create-hash":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/create-hash.js","./create-hmac":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/create-hmac.js","./pbkdf2":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/pbkdf2.js","./rng":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/rng.js","buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/md5.js":[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = require('./helpers');

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/helpers.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/pbkdf2-compat/pbkdf2.js":[function(require,module,exports){
(function (Buffer){
module.exports = function(crypto) {
  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
    if ('function' === typeof digest) {
      callback = digest
      digest = undefined
    }

    if ('function' !== typeof callback)
      throw new Error('No callback provided to pbkdf2')

    setTimeout(function() {
      var result

      try {
        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
      } catch (e) {
        return callback(e)
      }

      callback(undefined, result)
    })
  }

  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
    if ('number' !== typeof iterations)
      throw new TypeError('Iterations not a number')

    if (iterations < 0)
      throw new TypeError('Bad iterations')

    if ('number' !== typeof keylen)
      throw new TypeError('Key length not a number')

    if (keylen < 0)
      throw new TypeError('Bad key length')

    digest = digest || 'sha1'

    if (!Buffer.isBuffer(password)) password = new Buffer(password)
    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

    var hLen, l = 1, r, T
    var DK = new Buffer(keylen)
    var block1 = new Buffer(salt.length + 4)
    salt.copy(block1, 0, 0, salt.length)

    for (var i = 1; i <= l; i++) {
      block1.writeUInt32BE(i, salt.length)

      var U = crypto.createHmac(digest, password).update(block1).digest()

      if (!hLen) {
        hLen = U.length
        T = new Buffer(hLen)
        l = Math.ceil(keylen / hLen)
        r = keylen - (l - 1) * hLen

        if (keylen > (Math.pow(2, 32) - 1) * hLen)
          throw new TypeError('keylen exceeds maximum length')
      }

      U.copy(T, 0, 0, hLen)

      for (var j = 1; j < iterations; j++) {
        U = crypto.createHmac(digest, password).update(U).digest()

        for (var k = 0; k < hLen; k++) {
          T[k] ^= U[k]
        }
      }

      var destPos = (i - 1) * hLen
      var len = (i == l ? r : hLen)
      T.copy(DK, destPos, 0, len)
    }

    return DK
  }

  return {
    pbkdf2: pbkdf2,
    pbkdf2Sync: pbkdf2Sync
  }
}

}).call(this,require("buffer").Buffer)
},{"buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/ripemd160/lib/ripemd160.js":[function(require,module,exports){
(function (Buffer){

module.exports = ripemd160



/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/** @preserve
(c) 2012 by Cédric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Constants table
var zl = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
var zr = [
    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
var sl = [
     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
var sr = [
    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

var bytesToWords = function (bytes) {
  var words = [];
  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= bytes[i] << (24 - b % 32);
  }
  return words;
};

var wordsToBytes = function (words) {
  var bytes = [];
  for (var b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
  }
  return bytes;
};

var processBlock = function (H, M, offset) {

  // Swap endian
  for (var i = 0; i < 16; i++) {
    var offset_i = offset + i;
    var M_offset_i = M[offset_i];

    // Swap
    M[offset_i] = (
        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    );
  }

  // Working variables
  var al, bl, cl, dl, el;
  var ar, br, cr, dr, er;

  ar = al = H[0];
  br = bl = H[1];
  cr = cl = H[2];
  dr = dl = H[3];
  er = el = H[4];
  // Computation
  var t;
  for (var i = 0; i < 80; i += 1) {
    t = (al +  M[offset+zl[i]])|0;
    if (i<16){
        t +=  f1(bl,cl,dl) + hl[0];
    } else if (i<32) {
        t +=  f2(bl,cl,dl) + hl[1];
    } else if (i<48) {
        t +=  f3(bl,cl,dl) + hl[2];
    } else if (i<64) {
        t +=  f4(bl,cl,dl) + hl[3];
    } else {// if (i<80) {
        t +=  f5(bl,cl,dl) + hl[4];
    }
    t = t|0;
    t =  rotl(t,sl[i]);
    t = (t+el)|0;
    al = el;
    el = dl;
    dl = rotl(cl, 10);
    cl = bl;
    bl = t;

    t = (ar + M[offset+zr[i]])|0;
    if (i<16){
        t +=  f5(br,cr,dr) + hr[0];
    } else if (i<32) {
        t +=  f4(br,cr,dr) + hr[1];
    } else if (i<48) {
        t +=  f3(br,cr,dr) + hr[2];
    } else if (i<64) {
        t +=  f2(br,cr,dr) + hr[3];
    } else {// if (i<80) {
        t +=  f1(br,cr,dr) + hr[4];
    }
    t = t|0;
    t =  rotl(t,sr[i]) ;
    t = (t+er)|0;
    ar = er;
    er = dr;
    dr = rotl(cr, 10);
    cr = br;
    br = t;
  }
  // Intermediate hash value
  t    = (H[1] + cl + dr)|0;
  H[1] = (H[2] + dl + er)|0;
  H[2] = (H[3] + el + ar)|0;
  H[3] = (H[4] + al + br)|0;
  H[4] = (H[0] + bl + cr)|0;
  H[0] =  t;
};

function f1(x, y, z) {
  return ((x) ^ (y) ^ (z));
}

function f2(x, y, z) {
  return (((x)&(y)) | ((~x)&(z)));
}

function f3(x, y, z) {
  return (((x) | (~(y))) ^ (z));
}

function f4(x, y, z) {
  return (((x) & (z)) | ((y)&(~(z))));
}

function f5(x, y, z) {
  return ((x) ^ ((y) |(~(z))));
}

function rotl(x,n) {
  return (x<<n) | (x>>>(32-n));
}

function ripemd160(message) {
  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

  if (typeof message == 'string')
    message = new Buffer(message, 'utf8');

  var m = bytesToWords(message);

  var nBitsLeft = message.length * 8;
  var nBitsTotal = message.length * 8;

  // Add padding
  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
  );

  for (var i=0 ; i<m.length; i += 16) {
    processBlock(H, m, i);
  }

  // Swap endian
  for (var i = 0; i < 5; i++) {
      // Shortcut
    var H_i = H[i];

    // Swap
    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
  }

  var digestbytes = wordsToBytes(H);
  return new Buffer(digestbytes);
}



}).call(this,require("buffer").Buffer)
},{"buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/hash.js":[function(require,module,exports){
module.exports = function (Buffer) {

  //prototype class for hash functions
  function Hash (blockSize, finalSize) {
    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
    this._finalSize = finalSize
    this._blockSize = blockSize
    this._len = 0
    this._s = 0
  }

  Hash.prototype.init = function () {
    this._s = 0
    this._len = 0
  }

  Hash.prototype.update = function (data, enc) {
    if ("string" === typeof data) {
      enc = enc || "utf8"
      data = new Buffer(data, enc)
    }

    var l = this._len += data.length
    var s = this._s = (this._s || 0)
    var f = 0
    var buffer = this._block

    while (s < l) {
      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
      var ch = (t - f)

      for (var i = 0; i < ch; i++) {
        buffer[(s % this._blockSize) + i] = data[i + f]
      }

      s += ch
      f += ch

      if ((s % this._blockSize) === 0) {
        this._update(buffer)
      }
    }
    this._s = s

    return this
  }

  Hash.prototype.digest = function (enc) {
    // Suppose the length of the message M, in bits, is l
    var l = this._len * 8

    // Append the bit 1 to the end of the message
    this._block[this._len % this._blockSize] = 0x80

    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
    this._block.fill(0, this._len % this._blockSize + 1)

    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
      this._update(this._block)
      this._block.fill(0)
    }

    // to this append the block which is equal to the number l written in binary
    // TODO: handle case where l is > Math.pow(2, 29)
    this._block.writeInt32BE(l, this._blockSize - 4)

    var hash = this._update(this._block) || this._hash()

    return enc ? hash.toString(enc) : hash
  }

  Hash.prototype._update = function () {
    throw new Error('_update must be implemented by subclass')
  }

  return Hash
}

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/index.js":[function(require,module,exports){
var exports = module.exports = function (alg) {
  var Alg = exports[alg]
  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
  return new Alg()
}

var Buffer = require('buffer').Buffer
var Hash   = require('./hash')(Buffer)

exports.sha1 = require('./sha1')(Buffer, Hash)
exports.sha256 = require('./sha256')(Buffer, Hash)
exports.sha512 = require('./sha512')(Buffer, Hash)

},{"./hash":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/hash.js","./sha1":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/sha1.js","./sha256":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/sha256.js","./sha512":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/sha512.js","buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/sha1.js":[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = require('util').inherits

module.exports = function (Buffer, Hash) {

  var A = 0|0
  var B = 4|0
  var C = 8|0
  var D = 12|0
  var E = 16|0

  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

  var POOL = []

  function Sha1 () {
    if(POOL.length)
      return POOL.pop().init()

    if(!(this instanceof Sha1)) return new Sha1()
    this._w = W
    Hash.call(this, 16*4, 14*4)

    this._h = null
    this.init()
  }

  inherits(Sha1, Hash)

  Sha1.prototype.init = function () {
    this._a = 0x67452301
    this._b = 0xefcdab89
    this._c = 0x98badcfe
    this._d = 0x10325476
    this._e = 0xc3d2e1f0

    Hash.prototype.init.call(this)
    return this
  }

  Sha1.prototype._POOL = POOL
  Sha1.prototype._update = function (X) {

    var a, b, c, d, e, _a, _b, _c, _d, _e

    a = _a = this._a
    b = _b = this._b
    c = _c = this._c
    d = _d = this._d
    e = _e = this._e

    var w = this._w

    for(var j = 0; j < 80; j++) {
      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

      var t = add(
        add(rol(a, 5), sha1_ft(j, b, c, d)),
        add(add(e, W), sha1_kt(j))
      )

      e = d
      d = c
      c = rol(b, 30)
      b = a
      a = t
    }

    this._a = add(a, _a)
    this._b = add(b, _b)
    this._c = add(c, _c)
    this._d = add(d, _d)
    this._e = add(e, _e)
  }

  Sha1.prototype._hash = function () {
    if(POOL.length < 100) POOL.push(this)
    var H = new Buffer(20)
    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
    H.writeInt32BE(this._a|0, A)
    H.writeInt32BE(this._b|0, B)
    H.writeInt32BE(this._c|0, C)
    H.writeInt32BE(this._d|0, D)
    H.writeInt32BE(this._e|0, E)
    return H
  }

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  function sha1_ft(t, b, c, d) {
    if(t < 20) return (b & c) | ((~b) & d);
    if(t < 40) return b ^ c ^ d;
    if(t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
  }

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  function sha1_kt(t) {
    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
           (t < 60) ? -1894007588 : -899497514;
  }

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
   *
   */
  function add(x, y) {
    return (x + y ) | 0
  //lets see how this goes on testling.
  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  //  return (msw << 16) | (lsw & 0xFFFF);
  }

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  return Sha1
}

},{"util":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/util/util.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/sha256.js":[function(require,module,exports){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('util').inherits

module.exports = function (Buffer, Hash) {

  var K = [
      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
    ]

  var W = new Array(64)

  function Sha256() {
    this.init()

    this._w = W //new Array(64)

    Hash.call(this, 16*4, 14*4)
  }

  inherits(Sha256, Hash)

  Sha256.prototype.init = function () {

    this._a = 0x6a09e667|0
    this._b = 0xbb67ae85|0
    this._c = 0x3c6ef372|0
    this._d = 0xa54ff53a|0
    this._e = 0x510e527f|0
    this._f = 0x9b05688c|0
    this._g = 0x1f83d9ab|0
    this._h = 0x5be0cd19|0

    this._len = this._s = 0

    return this
  }

  function S (X, n) {
    return (X >>> n) | (X << (32 - n));
  }

  function R (X, n) {
    return (X >>> n);
  }

  function Ch (x, y, z) {
    return ((x & y) ^ ((~x) & z));
  }

  function Maj (x, y, z) {
    return ((x & y) ^ (x & z) ^ (y & z));
  }

  function Sigma0256 (x) {
    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
  }

  function Sigma1256 (x) {
    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
  }

  function Gamma0256 (x) {
    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
  }

  function Gamma1256 (x) {
    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
  }

  Sha256.prototype._update = function(M) {

    var W = this._w
    var a, b, c, d, e, f, g, h
    var T1, T2

    a = this._a | 0
    b = this._b | 0
    c = this._c | 0
    d = this._d | 0
    e = this._e | 0
    f = this._f | 0
    g = this._g | 0
    h = this._h | 0

    for (var j = 0; j < 64; j++) {
      var w = W[j] = j < 16
        ? M.readInt32BE(j * 4)
        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

      T2 = Sigma0256(a) + Maj(a, b, c);
      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
    }

    this._a = (a + this._a) | 0
    this._b = (b + this._b) | 0
    this._c = (c + this._c) | 0
    this._d = (d + this._d) | 0
    this._e = (e + this._e) | 0
    this._f = (f + this._f) | 0
    this._g = (g + this._g) | 0
    this._h = (h + this._h) | 0

  };

  Sha256.prototype._hash = function () {
    var H = new Buffer(32)

    H.writeInt32BE(this._a,  0)
    H.writeInt32BE(this._b,  4)
    H.writeInt32BE(this._c,  8)
    H.writeInt32BE(this._d, 12)
    H.writeInt32BE(this._e, 16)
    H.writeInt32BE(this._f, 20)
    H.writeInt32BE(this._g, 24)
    H.writeInt32BE(this._h, 28)

    return H
  }

  return Sha256

}

},{"util":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/util/util.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/sha.js/sha512.js":[function(require,module,exports){
var inherits = require('util').inherits

module.exports = function (Buffer, Hash) {
  var K = [
    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
  ]

  var W = new Array(160)

  function Sha512() {
    this.init()
    this._w = W

    Hash.call(this, 128, 112)
  }

  inherits(Sha512, Hash)

  Sha512.prototype.init = function () {

    this._a = 0x6a09e667|0
    this._b = 0xbb67ae85|0
    this._c = 0x3c6ef372|0
    this._d = 0xa54ff53a|0
    this._e = 0x510e527f|0
    this._f = 0x9b05688c|0
    this._g = 0x1f83d9ab|0
    this._h = 0x5be0cd19|0

    this._al = 0xf3bcc908|0
    this._bl = 0x84caa73b|0
    this._cl = 0xfe94f82b|0
    this._dl = 0x5f1d36f1|0
    this._el = 0xade682d1|0
    this._fl = 0x2b3e6c1f|0
    this._gl = 0xfb41bd6b|0
    this._hl = 0x137e2179|0

    this._len = this._s = 0

    return this
  }

  function S (X, Xl, n) {
    return (X >>> n) | (Xl << (32 - n))
  }

  function Ch (x, y, z) {
    return ((x & y) ^ ((~x) & z));
  }

  function Maj (x, y, z) {
    return ((x & y) ^ (x & z) ^ (y & z));
  }

  Sha512.prototype._update = function(M) {

    var W = this._w
    var a, b, c, d, e, f, g, h
    var al, bl, cl, dl, el, fl, gl, hl

    a = this._a | 0
    b = this._b | 0
    c = this._c | 0
    d = this._d | 0
    e = this._e | 0
    f = this._f | 0
    g = this._g | 0
    h = this._h | 0

    al = this._al | 0
    bl = this._bl | 0
    cl = this._cl | 0
    dl = this._dl | 0
    el = this._el | 0
    fl = this._fl | 0
    gl = this._gl | 0
    hl = this._hl | 0

    for (var i = 0; i < 80; i++) {
      var j = i * 2

      var Wi, Wil

      if (i < 16) {
        Wi = W[j] = M.readInt32BE(j * 4)
        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

      } else {
        var x  = W[j - 15*2]
        var xl = W[j - 15*2 + 1]
        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

        x  = W[j - 2*2]
        xl = W[j - 2*2 + 1]
        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
        var Wi7  = W[j - 7*2]
        var Wi7l = W[j - 7*2 + 1]

        var Wi16  = W[j - 16*2]
        var Wi16l = W[j - 16*2 + 1]

        Wil = gamma0l + Wi7l
        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
        Wil = Wil + gamma1l
        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
        Wil = Wil + Wi16l
        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

        W[j] = Wi
        W[j + 1] = Wil
      }

      var maj = Maj(a, b, c)
      var majl = Maj(al, bl, cl)

      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

      // t1 = h + sigma1 + ch + K[i] + W[i]
      var Ki = K[j]
      var Kil = K[j + 1]

      var ch = Ch(e, f, g)
      var chl = Ch(el, fl, gl)

      var t1l = hl + sigma1l
      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
      t1l = t1l + chl
      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
      t1l = t1l + Kil
      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
      t1l = t1l + Wil
      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

      // t2 = sigma0 + maj
      var t2l = sigma0l + majl
      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

      h  = g
      hl = gl
      g  = f
      gl = fl
      f  = e
      fl = el
      el = (dl + t1l) | 0
      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
      d  = c
      dl = cl
      c  = b
      cl = bl
      b  = a
      bl = al
      al = (t1l + t2l) | 0
      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
    }

    this._al = (this._al + al) | 0
    this._bl = (this._bl + bl) | 0
    this._cl = (this._cl + cl) | 0
    this._dl = (this._dl + dl) | 0
    this._el = (this._el + el) | 0
    this._fl = (this._fl + fl) | 0
    this._gl = (this._gl + gl) | 0
    this._hl = (this._hl + hl) | 0

    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
  }

  Sha512.prototype._hash = function () {
    var H = new Buffer(64)

    function writeInt64BE(h, l, offset) {
      H.writeInt32BE(h, offset)
      H.writeInt32BE(l, offset + 4)
    }

    writeInt64BE(this._a, this._al, 0)
    writeInt64BE(this._b, this._bl, 8)
    writeInt64BE(this._c, this._cl, 16)
    writeInt64BE(this._d, this._dl, 24)
    writeInt64BE(this._e, this._el, 32)
    writeInt64BE(this._f, this._fl, 40)
    writeInt64BE(this._g, this._gl, 48)
    writeInt64BE(this._h, this._hl, 56)

    return H
  }

  return Sha512

}

},{"util":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/util/util.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/pbkdf2.js":[function(require,module,exports){
var pbkdf2Export = require('pbkdf2-compat/pbkdf2')

module.exports = function (crypto, exports) {
  exports = exports || {}

  var exported = pbkdf2Export(crypto)

  exports.pbkdf2 = exported.pbkdf2
  exports.pbkdf2Sync = exported.pbkdf2Sync

  return exports
}

},{"pbkdf2-compat/pbkdf2":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/node_modules/pbkdf2-compat/pbkdf2.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/crypto-browserify/rng.js":[function(require,module,exports){
(function (global,Buffer){
(function() {
  var g = ('undefined' === typeof window ? global : window) || {}
  _crypto = (
    g.crypto || g.msCrypto || require('crypto')
  )
  module.exports = function(size) {
    // Modern Browsers
    if(_crypto.getRandomValues) {
      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
      /* This will not work in older browsers.
       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
       */
    
      _crypto.getRandomValues(bytes);
      return bytes;
    }
    else if (_crypto.randomBytes) {
      return _crypto.randomBytes(size)
    }
    else
      throw new Error(
        'secure random number generation not supported by this browser\n'+
        'use chrome, FireFox or Internet Explorer 11'
      )
  }
}())

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/buffer/index.js","crypto":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/browser-resolve/empty.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/util/support/isBufferBrowser.js":[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/util/util.js":[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","_process":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js","inherits":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/watchify/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/platformer.coffee":[function(require,module,exports){
var AiController, Entity, Level, RigidBody, aicontrollers, assign, bullet, bulletPhysics, bulletUpdates, c, canvas, collide, createEntity, ctx, dt, frame, fs, gun, last, level, mixin, monster, monsters, now, onkey, pathfinder, player, raf, render, setup, time, unitVector;

Entity = require('./modules/entity');

Level = require('./modules/level');

RigidBody = require('./modules/mixin-rigid-body');

assign = require('lodash.assign');

bulletPhysics = require('./modules/physics-bullet');

c = require('./modules/constants');

collide = require('./modules/physics-collide');



mixin = require('lodash.mixin');

raf = require('raf');

render = require('./modules/renderer');

time = require('./modules/time');

unitVector = require('./modules/v2-unit');

pathfinder = require('./modules/pathfinder');

AiController = require('./modules/ai');

canvas = document.getElementById('canvas');

ctx = canvas.getContext('2d');

dt = 0;

now = null;

last = time();

level = null;

player = null;

monster = null;

monsters = [];

gun = null;

bullet = null;

bulletUpdates = 3;

aicontrollers = [];

onkey = function(ev, key, down) {
  switch (key) {
    case c.KEY.LEFT:
      ev.preventDefault();
      player.left = down;
      return false;
    case c.KEY.RIGHT:
      ev.preventDefault();
      player.right = down;
      return false;
    case c.KEY.UP:
      ev.preventDefault();
      player.up = down;
      return false;
    case c.KEY.DOWN:
      ev.preventDefault();
      player.down = down;
      return false;
    case c.KEY.SPACE:
      ev.preventDefault();
      player.jump = down;
      return false;
    case c.KEY.CTRL:
      ev.preventDefault();
      gun.firing = down;
      return false;
    case c.KEY.GUNUP:
      ev.preventDefault();
      return gun.up = down;
    case c.KEY.GUNDOWN:
      ev.preventDefault();
      return gun.down = down;
  }
};

createEntity = function(obj) {
  var entity;
  entity = {
    xoff: obj.properties.hitbox.xoff,
    yoff: obj.properties.hitbox.yoff,
    render_width: obj.width,
    render_height: obj.height,
    x: obj.x,
    y: obj.y,
    start: {
      x: obj.x,
      y: obj.y
    },
    width: obj.properties.hitbox.width,
    height: obj.properties.hitbox.height
  };
  return new Entity(entity);
};

setup = function() {
  var level_data;
  level_data = JSON.parse("{ \"height\":48,\n \"layers\":[\n        {\n            \"data\":[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],\n         \"height\":48,\n         \"name\":\"background\",\n         \"opacity\":1,\n         \"type\":\"tilelayer\",\n         \"visible\":true,\n         \"width\":64,\n         \"x\":0,\n         \"y\":0\n        }, \n        {\n         \"height\":48,\n         \"name\":\"Object Layer 1\",\n         \"objects\":[\n                {\n                 \"height\":67,\n                 \"name\":\"player\",\n                 \"properties\":\n                    {\n                     \"hitbox\": { \"xoff\": 6, \"yoff\": 8, \"width\": 20, \"height\": 51 },\n                     \"maxjumpcount\": 3\n                     },\n                 \"type\":\"player\",\n                 \"visible\":true,\n                 \"width\":32,\n                 \"x\":96,\n                 \"y\":480\n                },\n                {\n                 \"height\":100,\n                 \"name\":\"player\",\n                 \"properties\":\n                    {\n                     \"hitbox\": {\"xoff\": 10, \"yoff\": 15, \"width\": 16, \"height\": 70}\n                     },\n                 \"type\":\"player\",\n                 \"visible\":true,\n                 \"width\":36,\n                 \"x\":400,\n                 \"y\":480\n                }     \n         ],\n         \"opacity\":1,\n         \"type\":\"objectgroup\",\n         \"visible\":true,\n         \"width\":64,\n         \"x\":0,\n         \"y\":0\n        }],\n \"orientation\":\"orthogonal\",\n \"properties\": { },\n \"tileheight\":32,\n \"tilesets\":[\n        {\n         \"firstgid\":1,\n         \"image\":\"tiles.png\",\n         \"imageheight\":32,\n         \"imagewidth\":160,\n         \"margin\":0,\n         \"name\":\"tiles\",\n         \"properties\":\n            {\n\n            },\n         \"spacing\":0,\n         \"tileheight\":32,\n         \"tilewidth\":32\n        }],\n \"tilewidth\":32,\n \"version\":1,\n \"width\":64\n}\n");
  level = new Level(level_data);
  canvas.width = level.width;
  canvas.height = level.height;
  player = createEntity(level_data.layers[1].objects[0]);
  player.maxjumpcount = 3;
  monster = createEntity(level_data.layers[1].objects[1]);
  monster.maxjumpcount = 3;
  gun = {
    angle: 0.001,
    firing: false,
    sensitivity: 5
  };
  pathfinder.preProcess(level);
  monsters = [monster];
  return aicontrollers = [new AiController(monster, player)];
};

frame = function() {
  var ai, collision, _i, _j, _k, _len, _len1, _len2;
  now = time();
  dt = dt + Math.min(1, (now - last) / 1000);
  if (gun.firing && (!bullet)) {
    bullet = {
      x: player.x,
      y: player.y,
      width: 10,
      height: 10,
      angle: gun.angle
    };
    bullet.dx = 1100 * Math.sin(bullet.angle);
    bullet.dy = -1100 * Math.cos(bullet.angle);
    bullet.dir = unitVector({
      x: bullet.dx,
      y: bullet.dy
    });
    bullet.perp = {
      x: bullet.dir.y,
      y: -bullet.dir.x
    };
  }
  while (dt > c.STEP) {
    dt = dt - c.STEP;
    player.step(level, c.STEP);
    for (_i = 0, _len = aicontrollers.length; _i < _len; _i++) {
      ai = aicontrollers[_i];
      ai.step();
    }
    for (_j = 0, _len1 = monsters.length; _j < _len1; _j++) {
      monster = monsters[_j];
      monster.step(level, c.STEP);
    }
    bulletPhysics.updateGun(gun, c.STEP);
    if (bullet) {
      collision = bulletPhysics.step(bullet, monsters, level, c.STEP);
      if (collision) {
        console.log(collision);
        bullet = null;
      }
    }
    for (_k = 0, _len2 = monsters.length; _k < _len2; _k++) {
      monster = monsters[_k];
      collide.entityCollide(player, monster);
    }
  }
  render(ctx, player, monsters, gun, bullet, level);
  last = now;
  return raf(frame, canvas);
};

document.addEventListener('keydown', function(ev) {
  return onkey(ev, ev.keyCode, true);
}, false);

document.addEventListener('keyup', function(ev) {
  return onkey(ev, ev.keyCode, false);
}, false);

setup();

frame();



},{"./modules/ai":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/ai.coffee","./modules/constants":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/constants.coffee","./modules/entity":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/entity.coffee","./modules/level":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/level.coffee","./modules/mixin-rigid-body":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/mixin-rigid-body.coffee","./modules/pathfinder":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/pathfinder.coffee","./modules/physics-bullet":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-bullet.coffee","./modules/physics-collide":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/physics-collide.coffee","./modules/renderer":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/renderer.coffee","./modules/time":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/time.coffee","./modules/v2-unit":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/modules/v2-unit.coffee","lodash.assign":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.assign/index.js","lodash.mixin":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/lodash.mixin/index.js","raf":"/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/node_modules/raf/index.js"}]},{},["/home/jm0037/webdev/elance/javascriptgame/collisions/basic-platform/platformer.coffee"]);
