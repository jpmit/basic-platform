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
  # for now a tile is subtracted because the physics engine represents the entity
  # as one tile, though it's actually drawn as 2
  ctx.fillRect(me.x + c.TILE, me.y - c.TILE, c.TILE, c.TILE*2)
