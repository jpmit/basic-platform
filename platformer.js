(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-from-rect.coffee":[function(require,module,exports){
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



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-intersect-line.coffee":[function(require,module,exports){
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



},{"./clamp":"/Users/michaelreinstein/wwwroot/basic-platform/modules/clamp.coffee","./sign":"/Users/michaelreinstein/wwwroot/basic-platform/modules/sign.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-intersect.coffee":[function(require,module,exports){
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



},{"./sign":"/Users/michaelreinstein/wwwroot/basic-platform/modules/sign.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-point-inside.coffee":[function(require,module,exports){
var pointInAABB;

module.exports = pointInAABB = function(point, box) {
  return (point.x > box.x) && (point.x < box.x + box.width) && (point.y > box.y) && (point.y < box.y + box.height);
};



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/clamp.coffee":[function(require,module,exports){
module.exports = function(x, min, max) {
  return Math.max(min, Math.min(max, x));
};



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee":[function(require,module,exports){
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



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/level.coffee":[function(require,module,exports){
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
    this.tw = obj.width;
    this.th = obj.height;
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
      return this.cells[tx + (ty * this.tw)];
    } else {
      return this.collision_cells[tx + (ty * this.tw)];
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



},{"./constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/mixin-rigid-body.coffee":[function(require,module,exports){
var RigidBodyMixin, c;

c = require('./constants');

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
    this.onLadder = false;
    this.ladderdx = 120;
    this.ladderdy = 120;
  }

  return RigidBodyMixin;

})();

module.exports = RigidBodyMixin;



},{"./constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics-collide.coffee":[function(require,module,exports){
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



},{"./aabb-from-rect":"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-from-rect.coffee","./aabb-intersect":"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-intersect.coffee","./constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics-move.coffee":[function(require,module,exports){
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



},{"./clamp":"/Users/michaelreinstein/wwwroot/basic-platform/modules/clamp.coffee","./constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics.coffee":[function(require,module,exports){
var c, collide, findNearestCollision, inAABB, inWater, intersectLine, move, onLadder, toAABB;

collide = require('./physics-collide');

c = require('./constants');

intersectLine = require('./aabb-intersect-line');

move = require('./physics-move');

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

inWater = function(entity, level) {
  return level.cellValue(entity.x + entity.width / 2, entity.y + entity.height / 2) === c.WTILE;
};

onLadder = function(entity, level) {
  var i, p, points, _i;
  points = [[entity.x, entity.y], [entity.x + entity.width, entity.y], [entity.x, entity.y + entity.height], [entity.x + entity.width, entity.y + entity.height]];
  for (i = _i = 0; _i <= 3; i = _i += 1) {
    p = points[i];
    if (level.cellValue(p[0], p[1]) === c.LTILE) {
      return true;
    }
  }
  return false;
};

module.exports.updateEntity = function(entity, level, dt) {
  var xnew, ynew;
  if (inWater(entity, level)) {
    entity.inWater = true;
  } else {
    entity.inWater = false;
  }
  if (onLadder(entity, level)) {
    if (!entity.onLadder) {
      entity.dy = 0;
      entity.dx = 0;
    }
    entity.onLadder = true;
  } else {
    entity.onLadder = false;
  }
  xnew = move.stepX(entity, level, dt);
  collide.levelCollideX(entity, level, xnew);
  ynew = move.stepY(entity, level, dt);
  return collide.levelCollideY(entity, level, ynew);
};

module.exports.updateBullet = function(bullet, entities, level, dt) {
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



},{"./aabb-from-rect":"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-from-rect.coffee","./aabb-intersect-line":"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-intersect-line.coffee","./aabb-point-inside":"/Users/michaelreinstein/wwwroot/basic-platform/modules/aabb-point-inside.coffee","./constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee","./physics-collide":"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics-collide.coffee","./physics-move":"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics-move.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/renderer.coffee":[function(require,module,exports){
var c, drawAngle, renderLevel;

c = require('./constants');

renderLevel = function(ctx, level) {
  var cell, x, y, _i, _ref, _results;
  _results = [];
  for (y = _i = 0, _ref = level.th - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
    _results.push((function() {
      var _j, _ref1, _results1;
      _results1 = [];
      for (x = _j = 0, _ref1 = level.tw - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
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
  return drawAngle(ctx, bullet);
};



},{"./constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee"}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/sign.coffee":[function(require,module,exports){
var sign;

module.exports = sign = function(value) {
  if (value < 0) {
    return -1;
  } else {
    return 1;
  }
};



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/time.coffee":[function(require,module,exports){
module.exports = function() {
  if ((typeof window !== "undefined" && window !== null) && window.performance && window.performance.now) {
    return window.performance.now();
  } else {
    return new Date().getTime();
  }
};



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/modules/v2-unit.coffee":[function(require,module,exports){
var unitVector;

module.exports = unitVector = function(v) {
  var dist;
  dist = Math.sqrt((v.x * v.x) + (v.y * v.y));
  return {
    x: v.x / dist,
    y: v.y / dist
  };
};



},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/index.js":[function(require,module,exports){
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

},{"lodash._basecreatecallback":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js","lodash._objecttypes":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js","lodash.keys":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/index.js":[function(require,module,exports){
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

},{"lodash._setbinddata":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js","lodash.bind":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js","lodash.identity":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js","lodash.support":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":[function(require,module,exports){
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

},{"lodash._isnative":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js","lodash.noop":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":[function(require,module,exports){
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

},{"lodash._createwrapper":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js","lodash._slice":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":[function(require,module,exports){
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

},{"lodash._basebind":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js","lodash._basecreatewrapper":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js","lodash._slice":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js","lodash.isfunction":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":[function(require,module,exports){
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

},{"lodash._basecreate":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js","lodash._setbinddata":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js","lodash._slice":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js","lodash.isobject":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":[function(require,module,exports){
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
},{"lodash._isnative":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js","lodash.isobject":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js","lodash.noop":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash.noop/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash._isnative/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash.noop/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js":[function(require,module,exports){
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

},{"lodash._objecttypes":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":[function(require,module,exports){
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

},{"lodash._basecreate":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash._basecreate/index.js","lodash._setbinddata":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js","lodash._slice":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js","lodash.isobject":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash._basecreate/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash.isobject/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":[function(require,module,exports){
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
},{"lodash._isnative":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/node_modules/lodash._isnative/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js":[function(require,module,exports){
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

},{}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/index.js":[function(require,module,exports){
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

},{"lodash._isnative":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._isnative/index.js","lodash._shimkeys":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js","lodash.isobject":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.support/node_modules/lodash._isnative/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":[function(require,module,exports){
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

},{"lodash._objecttypes":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._objecttypes/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":[function(require,module,exports){
module.exports=require("/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js")
},{"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/node_modules/lodash.isobject/index.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/raf/index.js":[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , native = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  native = false

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
  if(!native) {
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

},{"performance-now":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/raf/node_modules/performance-now/lib/performance-now.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/raf/node_modules/performance-now/lib/performance-now.js":[function(require,module,exports){
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
},{"_process":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/browserify/node_modules/process/browser.js"}],"/Users/michaelreinstein/wwwroot/basic-platform/platformer.coffee":[function(require,module,exports){
var Level, RigidBody, assign, bullet, bulletUpdates, c, canvas, collide, createEntity, ctx, dt, frame, fs, gun, last, level, monster, monsters, now, onkey, physics, player, raf, render, setup, time, unitVector;

Level = require('./modules/level');

RigidBody = require('./modules/mixin-rigid-body');

assign = require('lodash.assign');

c = require('./modules/constants');

collide = require('./modules/physics-collide');



physics = require('./modules/physics');

raf = require('raf');

render = require('./modules/renderer');

time = require('./modules/time');

unitVector = require('./modules/v2-unit');

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
    start: {
      x: obj.x,
      y: obj.y
    }
  };
  obj.width = obj.properties.hitbox.width;
  obj.height = obj.properties.hitbox.height;
  return assign(entity, new RigidBody(obj));
};

setup = function() {
  var level_data;
  level_data = JSON.parse("{ \"height\":48,\n \"layers\":[\n        {\n         \"data\":[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 6, 6, 6, 6, 6, 6, 6, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],\n         \"height\":48,\n         \"name\":\"background\",\n         \"opacity\":1,\n         \"type\":\"tilelayer\",\n         \"visible\":true,\n         \"width\":64,\n         \"x\":0,\n         \"y\":0\n        }, \n        {\n         \"height\":48,\n         \"name\":\"Object Layer 1\",\n         \"objects\":[\n                {\n                 \"height\":67,\n                 \"name\":\"player\",\n                 \"properties\":\n                    {\n                     \"hitbox\": { \"xoff\": 6, \"yoff\": 8, \"width\": 20, \"height\": 51 },\n                     \"maxjumpcount\": 3\n                     },\n                 \"type\":\"player\",\n                 \"visible\":true,\n                 \"width\":32,\n                 \"x\":96,\n                 \"y\":480\n                },\n                {\n                 \"height\":100,\n                 \"name\":\"player\",\n                 \"properties\":\n                    {\n                     \"hitbox\": {\"xoff\": 10, \"yoff\": 15, \"width\": 16, \"height\": 70}\n                     },\n                 \"type\":\"player\",\n                 \"visible\":true,\n                 \"width\":36,\n                 \"x\":400,\n                 \"y\":480\n                }     \n         ],\n         \"opacity\":1,\n         \"type\":\"objectgroup\",\n         \"visible\":true,\n         \"width\":64,\n         \"x\":0,\n         \"y\":0\n        }],\n \"orientation\":\"orthogonal\",\n \"properties\": { },\n \"tileheight\":32,\n \"tilesets\":[\n        {\n         \"firstgid\":1,\n         \"image\":\"tiles.png\",\n         \"imageheight\":32,\n         \"imagewidth\":160,\n         \"margin\":0,\n         \"name\":\"tiles\",\n         \"properties\":\n            {\n\n            },\n         \"spacing\":0,\n         \"tileheight\":32,\n         \"tilewidth\":32\n        }],\n \"tilewidth\":32,\n \"version\":1,\n \"width\":64\n}\n");
  level = new Level(level_data);
  canvas.width = level.width;
  canvas.height = level.height;
  player = createEntity(level_data.layers[1].objects[0]);
  player.maxjumpcount = 3;
  monster = createEntity(level_data.layers[1].objects[1]);
  gun = {
    angle: 0.001,
    firing: false,
    sensitivity: 5
  };
  return monsters = [monster];
};

frame = function() {
  var collision, _i, _j, _len, _len1;
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
    physics.updateEntity(player, level, c.STEP);
    for (_i = 0, _len = monsters.length; _i < _len; _i++) {
      monster = monsters[_i];
      physics.updateEntity(monster, level, c.STEP);
    }
    physics.updateGun(gun, c.STEP);
    if (bullet) {
      collision = physics.updateBullet(bullet, monsters, level, c.STEP);
      if (collision) {
        console.log(collision);
        bullet = null;
      }
    }
    for (_j = 0, _len1 = monsters.length; _j < _len1; _j++) {
      monster = monsters[_j];
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



},{"./modules/constants":"/Users/michaelreinstein/wwwroot/basic-platform/modules/constants.coffee","./modules/level":"/Users/michaelreinstein/wwwroot/basic-platform/modules/level.coffee","./modules/mixin-rigid-body":"/Users/michaelreinstein/wwwroot/basic-platform/modules/mixin-rigid-body.coffee","./modules/physics":"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics.coffee","./modules/physics-collide":"/Users/michaelreinstein/wwwroot/basic-platform/modules/physics-collide.coffee","./modules/renderer":"/Users/michaelreinstein/wwwroot/basic-platform/modules/renderer.coffee","./modules/time":"/Users/michaelreinstein/wwwroot/basic-platform/modules/time.coffee","./modules/v2-unit":"/Users/michaelreinstein/wwwroot/basic-platform/modules/v2-unit.coffee","lodash.assign":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/lodash.assign/index.js","raf":"/Users/michaelreinstein/wwwroot/basic-platform/node_modules/raf/index.js"}]},{},["/Users/michaelreinstein/wwwroot/basic-platform/platformer.coffee"]);
