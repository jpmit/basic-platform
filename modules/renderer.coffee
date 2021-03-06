c          = require './constants'
pathfinder = require './physics-pathfinder'

renderLevel = (ctx, level) ->
  for y in [0..level.rows-1]
    for x in [0..level.cols-1]
      cell = level.tileToValue x, y
      if cell
        ctx.fillStyle = c.COLORS[cell - 1]
        ctx.fillRect x * c.TILE, y * c.TILE, c.TILE, c.TILE
        ctx.fillStyle = c.COLOR.WHITE


# draw a sprite (currently just a rect) at some angle to vertical
drawAngle = (ctx, sprite) ->
  if (!sprite)
    return
  ctx.save()
  if (sprite.angle)
    hwidth = sprite.width / 2
    hheight = sprite.height / 2          
    ctx.translate(sprite.x + hwidth, sprite.y + hheight);
    ctx.rotate(sprite.angle);
    ctx.fillRect(-hwidth, -hheight, sprite.width, sprite.height);
  ctx.restore();


module.exports = (ctx, me, enemies, gun, bullet, level, pgraph, waypoints) ->
  ctx.clearRect 0, 0, level.width, level.height

  renderLevel ctx, level

  # draw the sprite bounding rectangles in blue
  ctx.fillStyle = c.COLOR.BLUE
  ctx.fillRect me.x-me.xoff, me.y-me.yoff, me.render_width, me.render_height

  for entity in enemies
    ctx.fillRect(entity.x - entity.xoff, entity.y - entity.yoff, entity.render_width, entity.render_height)

  # draw the player rigid body in yellow
  ctx.fillStyle = c.COLOR.YELLOW
  ctx.fillRect(me.x, me.y, me.width, me.height)

  # draw the monster rigid body in white
  for entity in enemies
    ctx.fillStyle = c.COLOR.WHITE
    ctx.fillRect entity.x, entity.y, entity.width, entity.height
    
  # draw the gun 'crosshair'
  gunx = me.x + me.width / 2 + Math.sin(gun.angle) * 50
  guny = me.y + me.height / 2 - Math.cos(gun.angle) * 50
  ctx.fillRect(gunx - 2, guny - 2, 4, 4)

  # draw the bullet (if there is one)
  drawAngle ctx, bullet

  # draw the waypoints
  for wp in waypoints
    ctx.fillStyle = c.COLOR.WHITE
    ctx.fillRect wp.x * c.TILE, wp.y * c.TILE, c.TILE, c.TILE

  pgraph.render ctx
