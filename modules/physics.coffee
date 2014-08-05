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
  wasleft = entity.dx < 0
  wasright = entity.dx > 0
  falling = entity.falling

  friction = entity.friction * ((if falling then 0.5 else 1))
  accel = entity.accel * ((if falling then 0.5 else 1))

  entity.ddx = 0
  entity.ddy = entity.gravity

  if entity.left
    entity.ddx = entity.ddx - accel
  else if wasleft
    entity.ddx = entity.ddx + friction

  if entity.right
    entity.ddx = entity.ddx + accel
  else if wasright
    entity.ddx = entity.ddx - friction

  if entity.jump and not entity.jumping and not falling
    entity.ddy = entity.ddy - entity.impulse # an instant big force impulse
    entity.jumping = true
  
  
  entity.x = entity.x + (dt * entity.dx)
  entity.y = entity.y + (dt * entity.dy)
  entity.dx = clamp(entity.dx + (dt * entity.ddx), -entity.maxdx, entity.maxdx)
  entity.dy = clamp(entity.dy + (dt * entity.ddy), -entity.maxdy, entity.maxdy)

  if (wasleft and (entity.dx > 0)) or (wasright and (entity.dx < 0))
    # clamp at zero to prevent friction from making us jiggle side to side
    entity.dx = 0 

  tx = level.pixelToTile entity.x
  ty = level.pixelToTile entity.y
  nx = entity.x % c.TILE
  ny = entity.y % c.TILE
  cell = level.tileToValue tx, ty, 'collision'
  cellright = level.tileToValue(tx + 1, ty, 'collision')
  celldown = level.tileToValue(tx, ty + 1, 'collision')
  celldiag = level.tileToValue(tx + 1, ty + 1, 'collision')

  if entity.dy > 0
    if (celldown and not cell) or (celldiag and not cellright and nx)
      entity.y = level.tileToPixel ty
      entity.dy = 0
      entity.falling = false
      entity.jumping = false
      ny = 0
  else if entity.dy < 0
    if (cell and not celldown) or (cellright and not celldiag and nx)
      entity.y = level.tileToPixel(ty + 1)
      entity.dy = 0
      cell = celldown
      cellright = celldiag
      ny = 0
  if entity.dx > 0
    if (cellright and not cell) or (celldiag and not celldown and ny)
      entity.x = level.tileToPixel tx
      entity.dx = 0
  else if entity.dx < 0
    if (cell and not cellright) or (celldown and not celldiag and ny)
      entity.x = level.tileToPixel(tx + 1)
      entity.dx = 0

  entity.falling = not (celldown or (nx and celldiag))
