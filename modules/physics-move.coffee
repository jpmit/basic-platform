c     = require './constants'
clamp = require './clamp'

# move an entity through the level in the x direction, return the new
# x position (top left co-ord of hitbox)
module.exports.stepX = (entity, level, dt) ->
  wasleft = entity.dx < 0
  wasright = entity.dx > 0
        
  friction = ((if entity.falling then 0.5 else 1)) * ((if entity.inWater then entity.wFriction else entity.friction))
  accel = ((if entity.falling then 0.5 else 1)) * ((if entity.inWater then entity.wAccel else entity.accel))

  entity.ddx = 0
  if entity.onLadder
    entity.dx = 0
    if entity.left
      entity.dx = -entity.ladderdx
    if entity.right
      entity.dx = entity.ladderdx
  else
    if entity.left
      entity.ddx = entity.ddx - accel
    else if wasleft
      entity.ddx = entity.ddx + friction
    
    if entity.right
      entity.ddx = entity.ddx + accel
    else if wasright
      entity.ddx = entity.ddx - friction

  entity.dx = clamp(entity.dx + (entity.ddx*dt), -entity.maxdx, entity.maxdx)

  if (wasleft and (entity.dx > 0)) or (wasright and (entity.dx < 0))
    # clamp at zero to prevent friction from making us jiggle side to side
    entity.dx = 0

  entity.hitbox.x + Math.floor(entity.dx * dt)


# move an entity through the level in the y direction, return the new
# y position (top left co-ord of hitbox)
module.exports.stepY = (entity, level, dt) ->

  entity.ddy = 0
  if entity.onLadder
    entity.dy = 0
    if entity.up
      entity.dy = -entity.ladderdy
    if entity.down
      entity.dy = 10 * entity.ladderdy
    console.log entity.up, entity.down, entity.dy
  else
    entity.ddy = entity.gravity
    
  if entity.inWater
    entity.ddy = entity.ddy - entity.buoyancy
    
  if entity.jump and not entity.jumping and (entity.onfloor or (entity.jumpcount < entity.maxjumpcount))
    entity.dy = 0
    # we probably shouldn't be able to jump as high if we are in water
    if entity.inWater
      entity.ddy = entity.ddy - entity.wImpulse
    else
      entity.ddy = entity.ddy - entity.impulse # an instant big force impulse
    entity.jumping = true
    entity.onfloor = false
    entity.jumpcount++

  entity.dy = clamp(entity.dy + (entity.ddy*dt), -entity.maxdy, entity.maxdy)

  if entity.dy > 0
    entity.jumping = false
    entity.falling = true
        
  entity.y + entity.hitbox.yoff + Math.floor(entity.dy * dt)
