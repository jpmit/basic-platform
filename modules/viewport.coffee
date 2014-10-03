# determine what tiles to render based on the position of an object that should
# be centered on the screen
c      = require './constants'
screen = require './screen'


class Viewport
  constructor: ->
    @offsetX = 0
    @offsetY = 0


  setScreenSize: (@screenWidth, @screenHeight)  ->
    # calculate how many tiles w and h fit on the screen
    @screenTilesW = Math.ceil(@screenWidth / c.TILE)
    @screenTilesH = Math.ceil(@screenHeight / c.TILE)


  # update the viewport to follow the object at pixel location x,y
  followObject: (x, y, level) ->
    if not y
      y = 0
    if not x
      x = 0

    col = x / c.TILE
    row = y / c.TILE

    @startCol = col - (@screenTilesW / 2)
    @startRow = row - (@screenTilesH / 2)

    if @startCol < 0
      @startCol = 0
    else if @startCol + @screenTilesW > level.width
      @startCol = level.width - @screenTilesW

    if @startRow < 0
      @startRow = 0
    else if @startRow + @screenTilesH > level.height
      @startRow = level.height - @screenTilesH

    if @startRow < 0
      @startRow = 0

    if @startCol < 0
      @startCol = 0

    @offsetX = @startCol * c.TILE
    @offsetY = @startRow * c.TILE


  # called whenver the window is resized
  resize: (canvas) ->
    #xy = screen.leftTop canvas
    canvas.width = window.innerWidth * screen.ratio
    canvas.height = window.innerHeight * screen.ratio

    # height and width that are logical canvas dimensions used for drawing are
    # different from the style dimensions. if you don't set the css dimensions
    # the intrinsic size of the canvas will be used as it's display size. If
    # they differ from the canvas dimensions, your content will be scaled in
    # the browser.
    # http://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5

    # handle retina devices by scaling the canvas size with css
    canvas.style.width = window.innerWidth + 'px' #(@canvas.width / screen.ratio) + 'px'
    canvas.style.height = window.innerHeight + 'px' #(@canvas.height / screen.ratio) + 'px'

    cw = screen.toCanvas window.innerWidth 
    ch = screen.toCanvas window.innerHeight

    @setScreenSize cw, ch

    # http://stackoverflow.com/questions/195262/can-i-turn-off-antialiasing-on-an-html-canvas-element
    ctx = canvas.getContext '2d'
    ctx.imageSmoothingEnabled = false
    ctx.webkitImageSmoothingEnabled = false
    ctx.mozImageSmoothingEnabled = false
    ctx.scale screen.scale_factor, screen.scale_factor


module.exports = new Viewport()
