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
    aabb = toAABB ent
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


# entity is in water if center point is on water tile
inWater = (entity, level) ->
  level.cellValue(entity.x + entity.width / 2, entity.y + entity.height / 2) == c.WTILE


# entity is on ladder if its rigid body overlaps with the ladder tile
onLadder = (entity, level) ->
  # get tile values at all four corners of rigid body and check if any are ladder tiles
  points = [[entity.x, entity.y],
            [entity.x + entity.width, entity.y],
            [entity.x, entity.y + entity.height],
            [entity.x + entity.width, entity.y + entity.height]]
  for i in [0..3] by 1
    p = points[i]
    if level.cellValue(p[0], p[1]) == c.LTILE
      return true
  return false


# run a physics update step on an entity.  We first get the x position
# we want to move the entity to (this will update the velocity and
# accelaration but not the position of the entity).  Then we move the
# entity to the correct x position based on collisions with the level.
module.exports.updateEntity = (entity, level, dt) ->

  if inWater entity, level
    entity.inWater = true
  else
    entity.inWater = false

  if onLadder entity, level
    if not entity.onLadder
      # first time on ladder
      entity.dy = 0
      entity.dx = 0
    entity.onLadder = true
  else
    entity.onLadder = false
  
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
