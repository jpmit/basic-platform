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

