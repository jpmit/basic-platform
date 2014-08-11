c = require './constants'

# collide two entities, each of which has a hitbox which is an AABB
collideEntity = (entity1, entity2) ->
  h1 = entity1.hitbox
  h2 = entity2.hitbox
  isCollision = not (((h1.x + h1.width) < h2.x) or
                     ((h2.x + h2.width) < h1.x) or 
                     ((h1.y + h1.height) < h2.y) or 
                     ((h2.y + h2.height) < h1.y))
  # if we have a collision, replace entity1 so that there is no longer a collision
  if isCollision
    if entity1.dx > 0 and h1.x + h1.width > h2.x
      console.log 'hit right'
      entity1.hitbox.x = h2.x - h1.width
    else if h1.x < h2.x + h2.width
      console.log 'hit left'
      entity1.hitbox.x = h2.x + h2.width
    #if h1.y + h1.height > h2.y
    #  entity2.hitbox.y = h1.y - (h1.y + h1.height - h2.y)
    #else if h1.y < h2.y + h2.height
    #  entity2.hitbox.y = h1.y + (h2.y + h2.height - h1.y)
    entity1.dx = 0
    entity1.ddx = 0
  
  isCollision

module.exports.levelCollideX = (entity, level, xnew) ->

  # current top left position of hitbox
  xold = entity.hitbox.x
  yold = entity.hitbox.y

  # set new position of hitbox
  entity.hitbox.x = xnew

  if entity.dx > 0
    # check any tiles along the right edge of the hitbox if we crossed
    # a 'tile boundary'.  Note we subtract 1 here in case the right edge of
    # the hitbox is exactly on a tile boundary.
    xtileold = level.pixelToTile (xold + entity.hitbox.width - 1)
    xtilenew = level.pixelToTile (xnew + entity.hitbox.width - 1)
  else if entity.dx < 0
    # check any tiles along the left edge of the hitbox if we
    # crossed a 'tile boundary'
    xtileold = level.pixelToTile xold
    xtilenew = level.pixelToTile xnew
  else
    xtileold = xtilenew = 0
          
  if xtileold != xtilenew
    # top and bottom y tiles to check
    ytiletop = level.pixelToTile yold
    ytilebottom = level.pixelToTile yold + entity.hitbox.height - 1
    for ytile in [ytilebottom..ytiletop]
        tentity = level.tileHitbox xtilenew, ytile
        if tentity
          # collideEntity will move entity hitbox if necessary
          if collideEntity entity, tentity
            break

  # sync the bounding box to the hitbox
  entity.rect.x = entity.hitbox.x - entity.hitbox.xoff

# move an entity through the level in the y direction
module.exports.levelCollideY = (entity, level, ynew) ->

  # current top left position of hitbox
  xold = entity.rect.x + entity.hitbox.xoff
  yold = entity.rect.y + entity.hitbox.yoff

  if entity.jumping
    # check any tiles at the top
    ytileold = level.pixelToTile yold
    ytilenew = level.pixelToTile ynew
    if ytileold != ytilenew
      # leftmost and rightmost x tiles to check
      xtileleft = level.pixelToTile xold
      xtileright = level.pixelToTile (xold + entity.hitbox.width - 1)
      for xtile in [xtileleft..xtileright]
          cell = level.tileToValue xtile, ytilenew
          if cell
            ynew = (ytilenew + 1) * c.TILE
            entity.jumping = false
            entity.dy = 0
            entity.ddy = 0
            break
  else if entity.falling
    # check any tiles at the bottom      
    ytileold = level.pixelToTile (yold + entity.hitbox.height - 1)
    ytilenew = level.pixelToTile (ynew + entity.hitbox.height - 1)
    if ytileold != ytilenew
      # leftmost and rightmost x tiles to check
      xtileleft = level.pixelToTile xold
      xtileright = level.pixelToTile (xold + entity.hitbox.width - 1)
      for xtile in [xtileleft..xtileright]
          cell = level.tileToValue xtile, ytilenew
          if cell
            ynew = (ytilenew) * c.TILE - entity.hitbox.height
            entity.onfloor = true
            entity.ddy = 0
            entity.dy = 0
            break

  entity.hitbox.y = ynew
  entity.rect.y = ynew - entity.hitbox.yoff
