collide       = require './physics-collide'
c             = require './constants'
intersectLine = require './aabb-intersect-line'
move          = require './physics-move'
inAABB        = require './aabb-point-inside'
toAABB        = require './aabb-from-rect'


findNearestCollision = (minX, maxX, minY, maxY, pos, delta, entities, level) ->
  aabbs = []
  # if any of the tiles are collidable, add their AABBs to the list
  for y in [minY..maxY]
    for x in [minX..maxX]
      if level.tileToValue(x, y, 'collision')
        aabb =
          pos:
            x: (x * c.TILE) + c.TILE / 2
            y: (y * c.TILE) + c.TILE / 2
          half:
            x: c.TILE / 2
            y: c.TILE / 2

        aabb.type = 'tile'
        aabbs.push aabb

  for ent in entities
    aabb = toAABB(ent.hitbox)
    aabb.type = 'entity'
    aabb.entity = ent
    aabbs.push aabb

  # narrow phase: take the potentially colliding aabbs and find the nearest collision
  nearestTime = 1
  nearestHit = null

  for aabb in aabbs
    hit = intersectLine aabb, pos, delta
    if hit and hit.time < nearestTime
      hit.type = aabb.type
      hit.entity = aabb.entity
      nearestTime = hit.time
      nearestHit = hit
  nearestHit


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
    jumpcount: 0
    maxjumpcount: obj.properties.maxjumpcount or 1

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


# returns closest tile/entity the bullet collided with
module.exports.updateBullet = (bullet, entities, level, dt) ->
  # broad phase: collect all tiles that overlap the path the bullet traveled through
  minX = Math.floor(bullet.x / c.TILE)
  maxX = Math.floor( (bullet.x + bullet.dx * dt) / c.TILE)
  minY = Math.floor(bullet.y / c.TILE)
  maxY = Math.floor( (bullet.y + bullet.dy * dt) / c.TILE)

  pos = { x: bullet.x, y: bullet.y }
  delta = { x: bullet.dx * dt, y: bullet.dy * dt }
  collision = findNearestCollision minX, maxX, minY, maxY, pos, delta, entities, level

  bullet.x += bullet.dx * dt
  bullet.y += bullet.dy * dt
  collision


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
