c          = require './constants'
clamp      = require './clamp'
unitVector = require './v2-unit'


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
    x: obj.x
    y: obj.y
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


# run a physics update step on an entity
module.exports.updateEntity = (entity, level, dt) ->

  friction = entity.friction * ((if entity.falling then 0.5 else 1))
  accel = entity.accel * ((if entity.falling then 0.5 else 1))

  # x movement
  entity.ddx = 0

  # handle x movement first
  if entity.left and not entity.right
    entity.ddx = entity.ddx - accel
  #else if wasleft
  #  entity.ddx = entity.ddx + friction
  else if entity.right and not entity.left
    entity.ddx = entity.ddx + accel

  # check for collisions with possible new tile(s) in x direction
  newx = entity.x + entity.ddx*dt

  # are we currently exactly on a tile in the x or y direction (before moving)?
  ontilex = (entity.x % c.TILE == 0)
  ontiley = (entity.y % c.TILE == 0)

  # if the player is n tiles tall, we need to check with either n or n
  # + 1 collision tiles.  If ontiley is true, we only need to check
  # with n tiles; otherwise we need to check with n + 1 tiles.  The
  # exact tiles we need to check depend on whether we are moving left
  # or moving right.
  tx = level.pixelToTile newx
  if entity.right and not entity.left
    tx = tx + 1 # +1 since width is 1 tile
  tytop = level.pixelToTile entity.y
  tymiddle = tytop + 1 # +1 since height is 2 tiles
  tybottom = tymiddle + 1
  celltop = level.tileToValue tx, tytop, 'collision'
  cellmiddle = level.tileToValue tx, tymiddle, 'collision'
  if ontiley
    cellbottom = 0
  else
    cellbottom = level.tileToValue tx, tybottom, 'collision'  

  if celltop or cellmiddle or cellbottom
    if entity.left
      newx = (tx + 1) * c.TILE
    else if entity.right
      console.log 'collide!', celltop, cellmiddle, cellbottom, ontiley, entity.y
      newx = (tx - 1) * c.TILE

  oldx = entity.x
  entity.x = newx

  # y movement
  # check bottom for collisions
  if entity.jumping
    entity.ddy = -entity.gravity
  else
    entity.ddy = entity.gravity

  newy = entity.y + dt*entity.ddy

  ontilex = (entity.x % c.TILE == 0)
  txleft = level.pixelToTile entity.x
  txright = txleft + 1
  ty = level.pixelToTile newy
  tybottom = ty + 2 # +2 since we are 2 tiles high
  cellbottomleft = level.tileToValue txleft, tybottom, 'collision'
  if ontilex
    cellbottomright = 0
  else
    cellbottomright = level.tileToValue txright, tybottom, 'collision'
  celltopleft = level.tileToValue txleft, ty, 'collision'
  if ontilex
    celltopright = 0
  else
    celltopright = level.tileToValue txright, ty, 'collision'

  if entity.jumping
    entity.jumpdt = entity.jumpdt + dt
#    console.log entity.jumpdt
    if entity.jumpdt > 1
      entity.jumping = false
  else
    entity.falling = true

  if entity.jumping
    if celltopleft or celltopright
      newy = (ty + 1)*c.TILE
      entity.jumping = false
  else if entity.falling
    if cellbottomleft or cellbottomright
      console.log 'on floor'
      newy = (tybottom - 2)*c.TILE
      console.log(newy)
    else
      console.log 'not on floor'

  # are we jumping?
  if entity.jump and ontiley and (cellbottomleft or cellbottomright)
    entity.jumping = true
    entity.falling = false
    entity.jumpdt = 0

  entity.y = newy
#  console.log entity.x
