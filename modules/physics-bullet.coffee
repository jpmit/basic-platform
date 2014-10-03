c             = require './constants'
intersectLine = require './aabb-intersect-line'
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


# returns closest tile/entity the bullet collided with
module.exports.step = (bullet, entities, level, dt) ->
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
