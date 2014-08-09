c = require './constants'


renderLevel = (ctx, level) ->
  for y in [0..level.th-1]
    for x in [0..level.tw-1]
      cell = level.tileToValue x, y
      if cell
        ctx.fillStyle = c.COLORS[cell - 1]
        ctx.fillRect x * c.TILE, y * c.TILE, c.TILE, c.TILE
        ctx.fillStyle = c.COLOR.WHITE
#        ctx.fillText "#{x},#{y}", x * c.TILE, y * c.TILE

module.exports = (ctx, me, level) ->
  ctx.clearRect 0, 0, level.width, level.height

  renderLevel ctx, level

  # draw the sprite (yellow)
  ctx.fillStyle = c.COLOR.YELLOW
  ctx.fillRect(me.rect.x, me.rect.y, me.rect.width, me.rect.height)

  # draw the hitbox in green
  ctx.fillStyle = c.COLOR.BLUE
  ctx.fillRect(me.rect.x + me.hitbox.xoff, me.rect.y + me.hitbox.yoff, me.hitbox.width, me.hitbox.height)
