intersectAABB = require './aabb-intersect'
toAABB        = require './aabb-from-rect'
c             = require './constants'

module.exports.levelCollideX = (entity, level, xnew) ->

  # current top left position of rigid body
  xold = entity.x
  yold = entity.y

  # set new position of rigid body
  entity.x = xnew

  if xnew > xold
    # check any tiles along the right edge of the rigid body if we crossed
    # a 'tile boundary'.  Note we subtract 1 here in case the right edge of
    # the rigid body is exactly on a tile boundary.
    xtileold = level.pixelToTile (xold + entity.width - 1)
    xtilenew = level.pixelToTile (xnew + entity.width - 1)
  else if xnew < xold
    # check any tiles along the left edge of the rigid body if we
    # crossed a 'tile boundary'
    xtileold = level.pixelToTile xold
    xtilenew = level.pixelToTile xnew
  else
    xtileold = xtilenew = null
          
  if xtileold != xtilenew
    # top and bottom y tiles to check
    ytiletop = level.pixelToTile yold
    ytilebottom = level.pixelToTile yold + entity.height - 1
    for ytile in [ytilebottom..ytiletop]
        tentity = level.tileEntity xtilenew, ytile
        if tentity and tentity.value in c.COLTILES
          entity.dx = 0
          entity.ddx = 0
          if xnew > xold
            entity.x = tentity.x - entity.width
          else
            entity.x = tentity.x + tentity.width


# move an entity through the level in the y direction
module.exports.levelCollideY = (entity, level, ynew) ->

  # current top left position of rigid body
  xold = entity.x
  yold = entity.y

  # set new position of rigid body
  entity.y = ynew

  if ynew < yold
    # check any tiles at the top
    ytileold = level.pixelToTile yold
    ytilenew = level.pixelToTile ynew
  else if ynew > yold and entity.falling
    # check any tiles at bottom
    ytileold = level.pixelToTile (yold + entity.height - 1)
    ytilenew = level.pixelToTile (ynew + entity.height - 1)
  else
    ytileold = ytilenew = null
               
  if ytileold != ytilenew
    # leftmost and rightmost x tiles to check
    xtileleft = level.pixelToTile xold
    xtileright = level.pixelToTile (xold + entity.width - 1)
    for xtile in [xtileleft..xtileright]
      tentity = level.tileEntity xtile, ytilenew            
      if tentity and tentity.value in c.COLTILES
        entity.dy = 0
        entity.ddy = 0
        if ynew < yold
          entity.y = tentity.y + tentity.height
        else
          entity.y = tentity.y - entity.height
          entity.onfloor = true
          entity.ytile = ytilenew
          entity.jumpcount = 0
        break 


# check if the player an monster collided and handle (currently in a
# rudimentary way).
module.exports.entityCollide = (entity1, entity2) ->

  if intersectAABB(toAABB(entity1), toAABB(entity2))
    # no shim for Math.sign put in here since this response is really
    # a temporary placeholder.
    if entity1.dx > 0
      entity1.dx = -500
    else if entity1.dx < 0
      entity1.dx = 500
