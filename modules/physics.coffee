collide    = require './physics-collide'
c          = require './constants'
move       = require './physics-move'
inAABB     = require './aabb-point-inside'


# create a new physics object using some initial settings
module.exports.setupEntity = (obj) ->
  obj.properties = obj.properties or {}
  maxdx = c.METER * (obj.properties.maxdx or c.MAXDX)

  # hitbox is optional; use rendering dimensions if not specified
  if not obj.properties.hitbox
    obj.properties.hitbox =
      xoff: 0
      yoff: 0
      width: obj.width
      height: obj.height
      
  entity =
    # the AABB of the entity, and the x, y co-ordinate is the
    # top left of the AABB (stored in pixels). The 'hitbox' can be
    # offset from this point by any amount in whole pixels.
    x: obj.x
    y: obj.y
    height: obj.height
    width: obj.width
    hitbox:
      # offsets from the top left in pixels
      xoff: obj.properties.hitbox.xoff
      yoff: obj.properties.hitbox.yoff
      width: obj.properties.hitbox.width
      height: obj.properties.hitbox.height
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

  entity.hitbox.x = entity.x + entity.hitbox.xoff
  entity.hitbox.y = entity.y + entity.hitbox.yoff

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


# returns an array containing tiles / entities bullet collided with
module.exports.updateBullet = (bullet, entities, level, dt) ->

  bullet.x += bullet.dx * dt
  bullet.y += bullet.dy * dt

  collided = []

  centerx = bullet.x + bullet.width / 2
  centery = bullet.y + bullet.height / 2
  topmidx = centerx + bullet.dir.x * bullet.height / 2
  topmidy = centery + bullet.dir.y * bullet.height / 2
  topleftx = topmidx + bullet.perp.x * bullet.width / 2
  toplefty = topmidy + bullet.perp.y * bullet.width / 2
  toprightx = topmidx - bullet.perp.x * bullet.width / 2
  toprighty = topmidy - bullet.perp.y * bullet.width / 2

  # store the two points on the front edge of the bullet
  bullet.topleft = {x: topleftx, y: toplefty}
  bullet.topright = {x: toprightx, y: toprighty}

  # check if the front points of the bullet collide with the level
  xtile1 = level.pixelToTile bullet.topleft.x
  ytile1 = level.pixelToTile bullet.topleft.y

  xtile2 = level.pixelToTile bullet.topright.x
  ytile2 = level.pixelToTile bullet.topright.y
  
  hitleft = false
  hitright = false
  if level.tileHitbox xtile1, ytile1
    hitleft = true
  if level.tileHitbox xtile2, ytile2
    hitright = true

  if hitleft
    collided.push {type: 'tile', location: [xtile1, ytile1], points: [bullet.topleft]}

  if hitright
    if xtile2 == xtile1 and ytile2 == ytile1
      # the same tile - add collision point
      collided[0].points.push bullet.topright
    else
      collided.push {type: 'tile', location: [xtile2, ytile2], points: [bullet.topright] }

  # check collisions with other entities
  for ent in entities
    if inAABB bullet.topleft, ent.hitbox
      collided.push {type: 'entity', entity: ent, points: [bullet.topleft]}
    if inAABB bullet.topright, ent.hitbox
      collided[collided.length - 1].points.push bullet.topright

  # return the array of objects the bullet collided with
  collided


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
