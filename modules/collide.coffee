c = require './constants'

# move an entity through the level in the x direction
module.exports.stepX = (entity, level, dt) ->
  wasleft = entity.dx < 0
  wasright = entity.dx > 0
        
  friction = entity.friction * ((if entity.falling then 0.5 else 1))
  accel = entity.accel * ((if entity.falling then 0.5 else 1))

  entity.ddx = 0

  if entity.left
    entity.ddx = entity.ddx - accel
  else if wasleft
    entity.ddx = entity.ddx + friction
    
  if entity.right
    entity.ddx = entity.ddx + accel
  else if wasright
    entity.ddx = entity.ddx - friction

  entity.dx = entity.dx + entity.ddx*dt

  if (wasleft and (entity.dx > 0)) or (wasright and (entity.dx < 0))
    # clamp at zero to prevent friction from making us jiggle side to side
    entity.dx = 0 

  # current top left position of hitbox
  xold = entity.rect.x + entity.hitbox.xoff
  yold = entity.rect.y + entity.hitbox.yoff
  # the new position before correcting for collisions
  xnew = Math.floor(xold + entity.dx * dt)

  if entity.dx > 0
    # check any tiles along the right edge of the hitbox if we crossed
    # a 'tile boundary'.  Note we subtract 1 here in case the right edge of
    # the hitbox is exactly on a tile boundary.
    xtileold = level.pixelToTile (xold + entity.hitbox.width - 1)
    xtilenew = level.pixelToTile (xnew + entity.hitbox.width - 1)
    if xtileold != xtilenew
      # top and bottom y tiles to check
      ytiletop = level.pixelToTile yold
      ytilebottom = level.pixelToTile yold + entity.hitbox.height - 1
      for ytile in [ytilebottom..ytiletop]
          cell = level.tileToValue xtilenew, ytile
          if cell
            # we hit a boundary
            xnew = xtilenew * c.TILE - entity.hitbox.width
            entity.ddx = 0
            entity.dx = 0
            break
  else if entity.dx < 0
    # check any tiles along the left edge of the hitbox if we
    # crossed a 'tile boundary'
    xtileold = level.pixelToTile xold
    xtilenew = level.pixelToTile xnew
    if xtileold != xtilenew
      # top and bottom y tiles to check
      ytiletop = level.pixelToTile yold
      ytilebottom = level.pixelToTile yold + entity.hitbox.height - 1
      for ytile in [ytilebottom..ytiletop]
          cell = level.tileToValue xtilenew, ytile
          if cell
            # we hit a boundary
            xnew = (xtilenew + 1) * c.TILE
            entity.ddx = 0
            entity.dx = 0
            break

  # move the actual sprite
  entity.rect.x = xnew - entity.hitbox.xoff

# move an entity through the level in the y direction
module.exports.stepY = (entity, level, dt) ->
  
  entity.ddy = entity.gravity
  if entity.jump and not entity.jumping and entity.onfloor
    entity.ddy = entity.ddy - entity.impulse # an instant big force impulse
    entity.jumping = true
    entity.onfloor = false

  entity.dy = entity.dy + dt * entity.ddy

  if entity.dy > 0
    entity.jumping = false
    entity.falling = true

  # current top left position of hitbox
  xold = entity.rect.x + entity.hitbox.xoff
  yold = entity.rect.y + entity.hitbox.yoff

  ynew = Math.floor(yold + dt*entity.dy)

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
            console.log 'onfloor'
            entity.onfloor = true
            entity.ddy = 0
            entity.dy = 0
            break

  entity.rect.y = ynew - entity.hitbox.yoff
