c = require './constants'


class Level
  constructor: (obj) ->
    @cells = obj.layers[0].data # cell rendering data
    @collision_cells = @cells
    @image = new Image()
    @objects = []
    #console.log 'uhggg', obj
    @width  = obj.width * c.TILE
    @height = obj.height * c.TILE
    @tw = obj.width
    @th = obj.height
    #c.MAP.tw = obj.width
    #c.MAP.th = obj.height


  # get the cell value for the cell at x,y expressed in pixels
  # type is 'render' or 'collision'
  cellValue: (x, y, type='render') ->
    @tileToValue @pixelToTile(x), @pixelToTile(y), type


  pixelToTile: (p) -> Math.floor p / c.TILE


  tileToPixel: (t) -> t * c.TILE


  # get the value at the given cell
  # type is 'render' or 'collision'
  # example  tileTovalue(0,1, cells) returns the value at col 0, row 1
  tileToValue: (tx, ty, type='render') ->
    if type is 'render'
      @cells[tx + (ty * @tw)]
    else
      @collision_cells[tx + (ty * @tw)] 


module.exports = Level
