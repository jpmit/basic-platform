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
    hwidth = sprite.rect.width / 2
    hheight = sprite.rect.height / 2          
    ctx.translate(sprite.rect.x + hwidth, sprite.rect.y + hheight);
    ctx.rotate(sprite.angle);
    ctx.fillRect(-hwidth, -hheight, sprite.rect.width, sprite.rect.height);
  ctx.restore();


module.exports = (ctx, me, him, gun, bullet, level) ->
  ctx.clearRect 0, 0, level.width, level.height

  renderLevel ctx, level

  # draw the player sprite in yellow
  ctx.fillStyle = c.COLOR.YELLOW
  ctx.fillRect(me.rect.x, me.rect.y, me.rect.width, me.rect.height)

  # draw the monster sprite in white
  ctx.fillStyle = c.COLOR.WHITE
  ctx.fillRect(him.rect.x, him.rect.y, him.rect.width, him.rect.height)

  # draw the hitboxes in blue
  ctx.fillStyle = c.COLOR.BLUE
  ctx.fillRect(me.rect.x + me.hitbox.xoff, me.rect.y + me.hitbox.yoff, me.hitbox.width, me.hitbox.height)
  ctx.fillRect(him.rect.x + him.hitbox.xoff, him.rect.y + him.hitbox.yoff, him.hitbox.width, him.hitbox.height)

  # draw the gun 'crosshair'
  gunx = me.rect.x + me.rect.width / 2 + Math.sin(gun.angle) * 50
  guny = me.rect.y + me.rect.height / 2 - Math.cos(gun.angle) * 50
  ctx.fillRect(gunx - 2, guny - 2, 4, 4)

  # draw the bullet (if there is one)
  drawAngle ctx, bullet              

  # draw the front points of the bullet for illustrative purposes
  ctx.fillStyle = c.COLOR.YELLOW
  if bullet
    ctx.fillRect(bullet.topleft.x, bullet.topleft.y, 1, 1)
    ctx.fillRect(bullet.topright.x, bullet.topright.y, 1, 1)
