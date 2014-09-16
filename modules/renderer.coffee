c = require './constants'


renderLevel = (ctx, level) ->
  for y in [0..level.th-1]
    for x in [0..level.tw-1]
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


module.exports = (ctx, me, enemies, gun, bullet, level) ->
  ctx.clearRect 0, 0, level.width, level.height

  renderLevel ctx, level

  # draw the player sprite in yellow
  ctx.fillStyle = c.COLOR.YELLOW
  ctx.fillRect(me.x, me.y, me.width, me.height)

  # draw the monster sprite in white
  for entity in enemies
    ctx.fillStyle = c.COLOR.WHITE
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height)

  # draw the hitboxes in blue
  ctx.fillStyle = c.COLOR.BLUE
  ctx.fillRect(me.x + me.hitbox.xoff, me.y + me.hitbox.yoff, me.hitbox.width, me.hitbox.height)

  for entity in enemies
    ctx.fillRect(entity.x + entity.hitbox.xoff, entity.y + entity.hitbox.yoff, entity.hitbox.width, entity.hitbox.height)

  # draw the gun 'crosshair'
  gunx = me.x + me.width / 2 + Math.sin(gun.angle) * 50
  guny = me.y + me.height / 2 - Math.cos(gun.angle) * 50
  ctx.fillRect(gunx - 2, guny - 2, 4, 4)

  # draw the bullet (if there is one)
  drawAngle ctx, bullet
