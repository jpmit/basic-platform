c          = require './constants'
clamp      = require './clamp'
unitVector = require './v2-unit'
collide    = require './collide'
move       = require './move'

# r is an angle in radians. returns a unit vector representing the direction
angleToVector = (r) ->
  UP = { x:0, y:1 }
  y = Math.cos(r) * UP.x - Math.sin(r) * UP.y
  x = Math.sin(r) * UP.x + Math.cos(r) * UP.y
  unitVector { x: -x, y: y }


# create a new physics object using some initial settings
module.exports.setupEntity = (obj) ->
  obj.properties = obj.properties or {}
  maxdx = c.METER * (obj.properties.maxdx or c.MAXDX)

  entity =
    # rect is the AABB of the entity, and the x, y co-ordinate is the
    # top left of the AABB (stored in pixels). The 'hitbox' can be
    # offset from this point by any amount in whole pixels.
    rect:
      x: obj.x
      y: obj.y
      height: 137#c.TILE * 2
      width: 34#c.TILE * 4
    hitbox:
      # offsets from the top left in pixels
      xoff: 5
      yoff: 20
    dx: 0
    dy: 0
    gravity : c.METER * (obj.properties.gravity or c.GRAVITY)
    maxdx   : maxdx
    maxdy   : c.METER * (obj.properties.maxdy or c.MAXDY)
    impulse : c.METER * (obj.properties.impulse or c.IMPULSE)
    accel   : maxdx / (obj.properties.accel or c.ACCEL)
    friction: maxdx / (obj.properties.friction or c.FRICTION)
    start:
      x: obj.x
      y: obj.y
    left    : obj.properties.left
    right   : obj.properties.right
    # JPM: added for testing
    up      : obj.properties.up
    down    : obj.properties.down 
    jump    : null

  entity.hitbox.x = entity.rect.x + entity.hitbox.xoff
  entity.hitbox.y = entity.rect.y + entity.hitbox.yoff
  entity.hitbox.height = entity.rect.height - 2 * entity.hitbox.yoff
  entity.hitbox.width = entity.rect.width - 2 * entity.hitbox.xoff

  return entity


# determine if 2 axially aligned bounding boxes overlap
module.exports.overlap = (x1, y1, w1, h1, x2, y2, w2, h2) ->
  not (((x1 + w1 - 1) < x2) or
    ((x2 + w2 - 1) < x1) or 
    ((y1 + h1 - 1) < y2) or 
    ((y2 + h2 - 1) < y1))


# collide a ray with the world and determine the collision tile
module.exports.rayCollide = (x, y, targetX, targetY, level, entities={}) ->
  radian = Math.atan2(y - targetY, x - targetX)
  rayUnit = angleToVector radian

  # scan along the ray until we hit a non-0 tile
  now = { x: x, y: y }
  collisionTile = null
  lastTileIdx = level.pixelToTile(now.x) + (level.pixelToTile(now.y) * c.MAP.tw)

  while Math.abs(now.x-targetX) > 0.1 and Math.abs(now.y-targetY) > 0.1
    now.x += (rayUnit.x * 0.1)
    now.y += (rayUnit.y * 0.1)
    index = level.pixelToTile(now.x) + (level.pixelToTile(now.y) * c.MAP.tw)
    if index isnt lastTileIdx
      # check a new tile
      value = level.cellValue now.x, now.y, 'collision'

      # check tile against all collision entities
      for id, e of entities
        if not e.dead
          entityTileIdx = level.pixelToTile(e.x) + (level.pixelToTile(e.y) * c.MAP.tw)
          if entityTileIdx is index
            return { type: 'entity', end: now, entity: e }

      if value isnt 0
        return { type: 'env', end: now }
      lastTileIdx = index


# run a physics update step on an entity.  We first get the x position
# we want to move the entity to (this will update the velocity and
# accelaration but not the position of the entity).  Then we move the
# entity to the correct x position based on collisions with the level.
 
module.exports.updateEntity = (entity, level, dt) ->

  xnew = move.stepX entity, level, dt
  collide.levelCollideX entity, level, xnew

  ynew = move.stepY entity, level, dt
  collide.levelCollideY entity, level, ynew

  # handle collisions with other entities

  
  # handle collisions with ray

