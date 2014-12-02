Grid2D = require './grid-2d'
assign = require 'lodash.assign'
c      = require './constants'
mixin  = require 'lodash.mixin'


class Level
  constructor: (obj) ->
    grid = new Grid2D obj.width, obj.height, obj.layers[0].data
    assign this, grid
    mixin this, grid
    @width  = @cols * c.TILE
    @height = @rows * c.TILE


  # get the cell value for the cell at x,y expressed in pixels
  cellValue: (x, y) ->
    @tileToValue @pixelToTile(x), @pixelToTile(y)


  pixelToTile: (p) -> Math.floor p / c.TILE


  # get the tile entity: mainly useful for hitbox property
  tileEntity: (tx, ty) ->
    val = @tileToValue tx, ty
    if val
      type: 'tile'
      value: val
      x : tx * c.TILE
      y : ty * c.TILE
      width : c.TILE
      height : c.TILE


  tileToPixel: (t) -> t * c.TILE


module.exports = Level
