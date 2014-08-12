c = require './constants'


renderLevel = (ctx, level) ->
  for y in [0..level.th-1]
    for x in [0..level.tw-1]
      cell = level.tileToValue x, y
      if cell
        ctx.fillStyle = c.COLORS[cell - 1]
        ctx.fillRect x * c.TILE, y * c.TILE, c.TILE, c.TILE
        ctx.fillStyle = c.COLOR.WHITE

module.exports = (ctx, me, him, level) ->
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
