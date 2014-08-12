c = require './constants'

# collide two entities, each of which has a hitbox which is an AABB
module.exports.overlapHitbox = (entity1, entity2) ->
  h1 = entity1.hitbox
  h2 = entity2.hitbox
  isCollision = not (((h1.x + h1.width) < h2.x) or
                     ((h2.x + h2.width) < h1.x) or 
                     ((h1.y + h1.height) < h2.y) or 
                     ((h2.y + h2.height) < h1.y))
  isCollision

module.exports.levelCollideX = (entity, level, xnew) ->

  # current top left position of hitbox
  xold = entity.hitbox.x
  yold = entity.hitbox.y

  # set new position of hitbox
  entity.hitbox.x = xnew

  if xnew > xold
    # check any tiles along the right edge of the hitbox if we crossed
    # a 'tile boundary'.  Note we subtract 1 here in case the right edge of
    # the hitbox is exactly on a tile boundary.
    xtileold = level.pixelToTile (xold + entity.hitbox.width - 1)
    xtilenew = level.pixelToTile (xnew + entity.hitbox.width - 1)
  else if xnew < xold
    # check any tiles along the left edge of the hitbox if we
    # crossed a 'tile boundary'
    xtileold = level.pixelToTile xold
    xtilenew = level.pixelToTile xnew
  else
    xtileold = xtilenew = null
          
  if xtileold != xtilenew
    # top and bottom y tiles to check
    ytiletop = level.pixelToTile yold
    ytilebottom = level.pixelToTile yold + entity.hitbox.height - 1
    for ytile in [ytilebottom..ytiletop]
        tentity = level.tileHitbox xtilenew, ytile
        if tentity
          entity.dx = 0
          entity.ddx = 0
          if xnew > xold
            entity.hitbox.x = tentity.hitbox.x - entity.hitbox.width
          else
            entity.hitbox.x = tentity.hitbox.x + tentity.hitbox.width
 
  entity.rect.x = entity.hitbox.x - entity.hitbox.xoff

# move an entity through the level in the y direction
module.exports.levelCollideY = (entity, level, ynew) ->

  # current top left position of hitbox
  xold = entity.hitbox.x
  yold = entity.hitbox.y

  # set new position of hitbox
  entity.hitbox.y = ynew

  if ynew < yold
    # check any tiles at the top
    ytileold = level.pixelToTile yold
    ytilenew = level.pixelToTile ynew
  else if ynew > yold and entity.falling
    # check any tiles at bottom
    ytileold = level.pixelToTile (yold + entity.hitbox.height - 1)
    ytilenew = level.pixelToTile (ynew + entity.hitbox.height - 1)
  else
    ytileold = ytilenew = null
               
  if ytileold != ytilenew
    # leftmost and rightmost x tiles to check
    xtileleft = level.pixelToTile xold
    xtileright = level.pixelToTile (xold + entity.hitbox.width - 1)
    for xtile in [xtileleft..xtileright]
      tentity = level.tileHitbox xtile, ytilenew            
      if tentity
        entity.dy = 0
        entity.ddy = 0
        if ynew < yold
          entity.hitbox.y = tentity.hitbox.y + tentity.hitbox.height
        else
          entity.hitbox.y = tentity.hitbox.y - entity.hitbox.height
          entity.onfloor = true
        break

  entity.rect.y = entity.hitbox.y - entity.hitbox.yoff  
