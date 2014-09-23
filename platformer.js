(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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



},{}],2:[function(require,module,exports){
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



},{"./clamp":5,"./sign":12}],3:[function(require,module,exports){
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



},{"./sign":12}],4:[function(require,module,exports){
var pointInAABB;

module.exports = pointInAABB = function(point, box) {
  return (point.x > box.x) && (point.x < box.x + box.width) && (point.y > box.y) && (point.y < box.y + box.height);
};



},{}],5:[function(require,module,exports){
module.exports = function(x, min, max) {
  return Math.max(min, Math.min(max, x));
};



},{}],6:[function(require,module,exports){
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
  GOLD: 'gold'
};

TILE = 32;

FPS = 60;

module.exports = {
  TILE: TILE,
  METER: TILE,
  GRAVITY: 9.8 * 6,
  MAXDX: 15,
  MAXDY: 60,
  ACCEL: 1 / 2,
  FRICTION: 1 / 6,
  IMPULSE: 1500,
  COLOR: COLOR,
  COLORS: [COLOR.YELLOW, COLOR.BRICK, COLOR.PINK, COLOR.PURPLE, COLOR.GREY],
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



},{}],7:[function(require,module,exports){
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
        hitbox: {
          x: tx * c.TILE,
          y: ty * c.TILE,
          width: c.TILE,
          height: c.TILE
        }
      };
    }
  };

  return Level;

})();

module.exports = Level;



},{"./constants":6}],8:[function(require,module,exports){
var intersectAABB, toAABB;

intersectAABB = require('./aabb-intersect');

toAABB = require('./aabb-from-rect');

module.exports.levelCollideX = function(entity, level, xnew) {
  var tentity, xold, xtilenew, xtileold, yold, ytile, ytilebottom, ytiletop, _i;
  xold = entity.hitbox.x;
  yold = entity.hitbox.y;
  entity.hitbox.x = xnew;
  if (xnew > xold) {
    xtileold = level.pixelToTile(xold + entity.hitbox.width - 1);
    xtilenew = level.pixelToTile(xnew + entity.hitbox.width - 1);
  } else if (xnew < xold) {
    xtileold = level.pixelToTile(xold);
    xtilenew = level.pixelToTile(xnew);
  } else {
    xtileold = xtilenew = null;
  }
  if (xtileold !== xtilenew) {
    ytiletop = level.pixelToTile(yold);
    ytilebottom = level.pixelToTile(yold + entity.hitbox.height - 1);
    for (ytile = _i = ytilebottom; ytilebottom <= ytiletop ? _i <= ytiletop : _i >= ytiletop; ytile = ytilebottom <= ytiletop ? ++_i : --_i) {
      tentity = level.tileEntity(xtilenew, ytile);
      if (tentity) {
        entity.dx = 0;
        entity.ddx = 0;
        if (xnew > xold) {
          entity.hitbox.x = tentity.hitbox.x - entity.hitbox.width;
        } else {
          entity.hitbox.x = tentity.hitbox.x + tentity.hitbox.width;
        }
      }
    }
  }
  return entity.x = entity.hitbox.x - entity.hitbox.xoff;
};

module.exports.levelCollideY = function(entity, level, ynew) {
  var tentity, xold, xtile, xtileleft, xtileright, yold, ytilenew, ytileold, _i;
  xold = entity.hitbox.x;
  yold = entity.hitbox.y;
  entity.hitbox.y = ynew;
  if (ynew < yold) {
    ytileold = level.pixelToTile(yold);
    ytilenew = level.pixelToTile(ynew);
  } else if (ynew > yold && entity.falling) {
    ytileold = level.pixelToTile(yold + entity.hitbox.height - 1);
    ytilenew = level.pixelToTile(ynew + entity.hitbox.height - 1);
  } else {
    ytileold = ytilenew = null;
  }
  if (ytileold !== ytilenew) {
    xtileleft = level.pixelToTile(xold);
    xtileright = level.pixelToTile(xold + entity.hitbox.width - 1);
    for (xtile = _i = xtileleft; xtileleft <= xtileright ? _i <= xtileright : _i >= xtileright; xtile = xtileleft <= xtileright ? ++_i : --_i) {
      tentity = level.tileEntity(xtile, ytilenew);
      if (tentity) {
        entity.dy = 0;
        entity.ddy = 0;
        if (ynew < yold) {
          entity.hitbox.y = tentity.hitbox.y + tentity.hitbox.height;
        } else {
          entity.hitbox.y = tentity.hitbox.y - entity.hitbox.height;
          entity.onfloor = true;
        }
        break;
      }
    }
  }
  return entity.y = entity.hitbox.y - entity.hitbox.yoff;
};

module.exports.entityCollide = function(entity1, entity2) {
  if (intersectAABB(toAABB(entity1.hitbox), toAABB(entity2.hitbox))) {
    if (entity1.dx > 0) {
      return entity1.dx = -500;
    } else if (entity1.dx < 0) {
      return entity1.dx = 500;
    }
  }
};



},{"./aabb-from-rect":1,"./aabb-intersect":3}],9:[function(require,module,exports){
var c, clamp;

c = require('./constants');

clamp = require('./clamp');

module.exports.stepX = function(entity, level, dt) {
  var accel, friction, wasleft, wasright;
  wasleft = entity.dx < 0;
  wasright = entity.dx > 0;
  friction = entity.friction * (entity.falling ? 0.5 : 1);
  accel = entity.accel * (entity.falling ? 0.5 : 1);
  entity.ddx = 0;
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
  entity.dx = clamp(entity.dx + (entity.ddx * dt), -entity.maxdx, entity.maxdx);
  if ((wasleft && (entity.dx > 0)) || (wasright && (entity.dx < 0))) {
    entity.dx = 0;
  }
  return entity.hitbox.x + Math.floor(entity.dx * dt);
};

module.exports.stepY = function(entity, level, dt) {
  entity.ddy = entity.gravity;
  if (entity.jump && !entity.jumping && entity.onfloor) {
    entity.ddy = entity.ddy - entity.impulse;
    entity.jumping = true;
    entity.onfloor = false;
  }
  entity.dy = clamp(entity.dy + (entity.ddy * dt), -entity.maxdy, entity.maxdy);
  if (entity.dy > 0) {
    entity.jumping = false;
    entity.falling = true;
  }
  return entity.y + entity.hitbox.yoff + Math.floor(entity.dy * dt);
};



},{"./clamp":5,"./constants":6}],10:[function(require,module,exports){
var c, collide, findNearestCollision, inAABB, intersectLine, move, toAABB;

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
    aabb = toAABB(ent.hitbox);
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

module.exports.setupEntity = function(obj) {
  var entity, maxdx;
  obj.properties = obj.properties || {};
  maxdx = c.METER * (obj.properties.maxdx || c.MAXDX);
  if (!obj.properties.hitbox) {
    obj.properties.hitbox = {
      xoff: 0,
      yoff: 0,
      width: obj.width,
      height: obj.height
    };
  }
  entity = {
    x: obj.x,
    y: obj.y,
    height: obj.height,
    width: obj.width,
    hitbox: {
      xoff: obj.properties.hitbox.xoff,
      yoff: obj.properties.hitbox.yoff,
      width: obj.properties.hitbox.width,
      height: obj.properties.hitbox.height
    },
    dx: 0,
    dy: 0,
    gravity: c.METER * (obj.properties.gravity || c.GRAVITY),
    maxdx: maxdx,
    maxdy: c.METER * (obj.properties.maxdy || c.MAXDY),
    impulse: c.METER * (obj.properties.impulse || c.IMPULSE),
    accel: maxdx / (obj.properties.accel || c.ACCEL),
    friction: maxdx / (obj.properties.friction || c.FRICTION),
    start: {
      x: obj.x,
      y: obj.y
    },
    left: obj.properties.left,
    right: obj.properties.right,
    jump: null
  };
  entity.hitbox.x = entity.x + entity.hitbox.xoff;
  entity.hitbox.y = entity.y + entity.hitbox.yoff;
  return entity;
};

module.exports.updateEntity = function(entity, level, dt) {
  var xnew, ynew;
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



},{"./aabb-from-rect":1,"./aabb-intersect-line":2,"./aabb-point-inside":4,"./constants":6,"./physics-collide":8,"./physics-move":9}],11:[function(require,module,exports){
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
  ctx.fillStyle = c.COLOR.YELLOW;
  ctx.fillRect(me.x, me.y, me.width, me.height);
  for (_i = 0, _len = enemies.length; _i < _len; _i++) {
    entity = enemies[_i];
    ctx.fillStyle = c.COLOR.WHITE;
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
  }
  ctx.fillStyle = c.COLOR.BLUE;
  ctx.fillRect(me.x + me.hitbox.xoff, me.y + me.hitbox.yoff, me.hitbox.width, me.hitbox.height);
  for (_j = 0, _len1 = enemies.length; _j < _len1; _j++) {
    entity = enemies[_j];
    ctx.fillRect(entity.x + entity.hitbox.xoff, entity.y + entity.hitbox.yoff, entity.hitbox.width, entity.hitbox.height);
  }
  gunx = me.x + me.width / 2 + Math.sin(gun.angle) * 50;
  guny = me.y + me.height / 2 - Math.cos(gun.angle) * 50;
  ctx.fillRect(gunx - 2, guny - 2, 4, 4);
  return drawAngle(ctx, bullet);
};



},{"./constants":6}],12:[function(require,module,exports){
var sign;

module.exports = sign = function(value) {
  if (value < 0) {
    return -1;
  } else {
    return 1;
  }
};



},{}],13:[function(require,module,exports){
module.exports = function() {
  if ((typeof window !== "undefined" && window !== null) && window.performance && window.performance.now) {
    return window.performance.now();
  } else {
    return new Date().getTime();
  }
};



},{}],14:[function(require,module,exports){
var unitVector;

module.exports = unitVector = function(v) {
  var dist;
  dist = Math.sqrt((v.x * v.x) + (v.y * v.y));
  return {
    x: v.x / dist,
    y: v.y / dist
  };
};



},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"performance-now":17}],17:[function(require,module,exports){
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

}).call(this,require("FWaASH"))
},{"FWaASH":15}],18:[function(require,module,exports){
var Level, bullet, bulletUpdates, c, canvas, collide, ctx, dt, enemyEntities, frame, fs, gun, last, level, monster, now, onkey, physics, player, raf, render, setup, time, unitVector;

Level = require('./modules/level');

c = require('./modules/constants');



physics = require('./modules/physics');

collide = require('./modules/physics-collide');

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

enemyEntities = [];

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

setup = function() {
  var level_data;
  level_data = JSON.parse("{ \"height\":48,\n \"layers\":[\n        {\n         \"data\":[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],\n         \"height\":48,\n         \"name\":\"background\",\n         \"opacity\":1,\n         \"type\":\"tilelayer\",\n         \"visible\":true,\n         \"width\":64,\n         \"x\":0,\n         \"y\":0\n        }, \n        {\n         \"height\":48,\n         \"name\":\"Object Layer 1\",\n         \"objects\":[\n                {\n                 \"height\":67,\n                 \"name\":\"player\",\n                 \"properties\":\n                    {\n                     \"hitbox\": { \"xoff\": 6, \"yoff\": 8, \"width\": 20, \"height\": 51 }\n                     },\n                 \"type\":\"player\",\n                 \"visible\":true,\n                 \"width\":32,\n                 \"x\":96,\n                 \"y\":480\n                },\n                {\n                 \"height\":100,\n                 \"name\":\"player\",\n                 \"properties\":\n                    {\n                     \"hitbox\": {\"xoff\": 10, \"yoff\": 15, \"width\": 16, \"height\": 70}\n                     },\n                 \"type\":\"player\",\n                 \"visible\":true,\n                 \"width\":36,\n                 \"x\":400,\n                 \"y\":480\n                }     \n         ],\n         \"opacity\":1,\n         \"type\":\"objectgroup\",\n         \"visible\":true,\n         \"width\":64,\n         \"x\":0,\n         \"y\":0\n        }],\n \"orientation\":\"orthogonal\",\n \"properties\": { },\n \"tileheight\":32,\n \"tilesets\":[\n        {\n         \"firstgid\":1,\n         \"image\":\"tiles.png\",\n         \"imageheight\":32,\n         \"imagewidth\":160,\n         \"margin\":0,\n         \"name\":\"tiles\",\n         \"properties\":\n            {\n\n            },\n         \"spacing\":0,\n         \"tileheight\":32,\n         \"tilewidth\":32\n        }],\n \"tilewidth\":32,\n \"version\":1,\n \"width\":64\n}\n");
  level = new Level(level_data);
  canvas.width = level.width;
  canvas.height = level.height;
  player = physics.setupEntity(level_data.layers[1].objects[0]);
  monster = physics.setupEntity(level_data.layers[1].objects[1]);
  gun = {
    angle: 0.001,
    firing: false,
    sensitivity: 5
  };
  return enemyEntities = [monster];
};

frame = function() {
  var collision, entity, _i, _j, _len, _len1;
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
    for (_i = 0, _len = enemyEntities.length; _i < _len; _i++) {
      entity = enemyEntities[_i];
      physics.updateEntity(entity, level, c.STEP);
    }
    physics.updateGun(gun, c.STEP);
    if (bullet) {
      collision = physics.updateBullet(bullet, enemyEntities, level, c.STEP);
      if (collision) {
        console.log(collision);
        bullet = null;
      }
    }
    for (_j = 0, _len1 = enemyEntities.length; _j < _len1; _j++) {
      entity = enemyEntities[_j];
      collide.entityCollide(player, entity);
    }
  }
  render(ctx, player, enemyEntities, gun, bullet, level);
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



},{"./modules/constants":6,"./modules/level":7,"./modules/physics":10,"./modules/physics-collide":8,"./modules/renderer":11,"./modules/time":13,"./modules/v2-unit":14,"raf":16}]},{},[18])