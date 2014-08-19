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
      height: obj.height
      width: obj.width
    hitbox:
      # offsets from the top left in pixels
      xoff: obj.properties.hitbox.xoff
      yoff: obj.properties.hitbox.yoff
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
    jump    : null

  entity.hitbox.x = entity.rect.x + entity.hitbox.xoff
  entity.hitbox.y = entity.rect.y + entity.hitbox.yoff
  entity.hitbox.height = entity.rect.height - 2 * entity.hitbox.yoff
  entity.hitbox.width = entity.rect.width - 2 * entity.hitbox.xoff

  return entity

# run a physics update step on an entity.  We first get the x position
# we want to move the entity to (this will update the velocity and
# accelaration but not the position of the entity).  Then we move the
# entity to the correct x position based on collisions with the level.
module.exports.updateEntity = (entity, level, dt) ->

  xnew = move.stepX entity, level, dt
  collide.levelCollideX entity, level, xnew

  ynew = move.stepY entity, level, dt
  collide.levelCollideY entity, level, ynew


# returns true / false if bullet collided with level or not
module.exports.updateBullet = (bullet, level, dt) ->

  bullet.rect.x += bullet.dx * dt
  bullet.rect.y += bullet.dy * dt

  # store the two points on the front edge of the bullet
  centerx = bullet.rect.x + bullet.rect.width / 2
  centery = bullet.rect.y + bullet.rect.height / 2
  topmidx = centerx + bullet.dir.x * bullet.rect.height / 2
  topmidy = centery + bullet.dir.y * bullet.rect.height / 2
  topleftx = topmidx + bullet.perp.x * bullet.rect.width / 2
  toplefty = topmidy + bullet.perp.y * bullet.rect.width / 2
  toprightx = topmidx - bullet.perp.x * bullet.rect.width / 2
  toprighty = topmidy - bullet.perp.y * bullet.rect.width / 2

  bullet.topleft = {x: topleftx, y: toplefty}
  bullet.topright = {x: toprightx, y: toprighty}

  # check if the 'topleft' or 'topright' points of the bullet collide
  # with the level
  xtile1 = level.pixelToTile bullet.topleft.x
  ytile1 = level.pixelToTile bullet.topleft.y

  if level.tileHitbox xtile1, ytile1
    return true

  xtile2 = level.pixelToTile bullet.topright.x
  ytile2 = level.pixelToTile bullet.topright.y

  if level.tileHitbox xtile2, ytile2
    return true

  
# update 'crosshairs' (the small blue rect close to the player)
module.exports.updateGun = (gun, dt) ->

  if gun.up
    gun.angle -= gun.sensitivity * dt

  if gun.down
    gun.angle += gun.sensitivity * dt
                                
  if gun.angle < 0
    gun.angle = 0.001
  else if gun.angle > Math.PI / 2
    gun.angle = Math.PI / 2
