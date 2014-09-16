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

  centerx = bullet.x + bullet.width / 2
  centery = bullet.y + bullet.height / 2
  topmidx = centerx + bullet.dir.x * bullet.height / 2
  topmidy = centery + bullet.dir.y * bullet.height / 2

  # store the points on the tip of the bullet
  bullet.topmid = { x: topmidx, y: topmidy }

  # get the index of the tile at the tip of the bullet
  xtile = level.pixelToTile bullet.topmid.x
  ytile = level.pixelToTile bullet.topmid.y

  tentity = level.tileEntity xtile, ytile
  if tentity
    # add the tile to the entity list, hence consider for collisions
    entities.push tentity

  collided = []
  for ent in entities
    if inAABB bullet.topmid, ent.hitbox
      hb = ent.hitbox
      x = bullet.topmid.x
      y = bullet.topmid.y

      # penetration into each face clockwise starting from top
      pens = [y - hb.y, hb.x + hb.width - x, hb.y + hb.height - y, x - hb.x]
      # corresponding face normals
      normals = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}]
      # and collision points
      points = [{x: x, y: hb.y}, {x: hb.x + hb.width, y: y},
                {x: x, y: hb.y + hb.height}, {x: hb.x, y: y}]

      # work out which face we penetrated beyond least, hence surface normal and collision point
      minp = pens[0]
      mini = 0
      for i in [1..3]
        if (pens[i] < minp)
          mini = i
          minp = pens[i]

      collided.push {type: ent.type || 'entity', point: points[mini], normal: normals[mini]}

  if tentity
    # remove the tile entity from the entity array
    entities.pop tentity
    
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
