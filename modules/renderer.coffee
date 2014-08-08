c = require './constants'


renderLevel = (ctx, level) ->
  for y in [0..level.th-1]
    for x in [0..level.tw-1]
      cell = level.tileToValue x, y
      if cell
        ctx.fillStyle = c.COLORS[cell - 1]
        ctx.fillRect x * c.TILE, y * c.TILE, c.TILE, c.TILE

module.exports = (ctx, me, level) ->
  ctx.clearRect 0, 0, level.width, level.height

  renderLevel ctx, level

  ctx.fillStyle = c.COLORS.YELLOW
  # x and y always store the top left co-ord of the bounding box.
  # Here the player is one tile wide and two tiles tall.
  ctx.fillRect(me.x, me.y, c.TILE, c.TILE*2)
