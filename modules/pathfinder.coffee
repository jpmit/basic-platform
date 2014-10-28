c = require './constants'

class Platform
  constructor: (xleft, xright, y) ->
    # note these are tile and not pixel coords
    @xleft = xleft
    @xright = xright
    @y = y

  # does the platform's x position overlap with the range given?
  overlap: (xleft, xright) ->
    not (@xright < xleft or @xleft > xright)

# placeholder currently for relevant pathfinding physics.
class PhysicsFinder
  constructor: () ->
    # max number of tiles we can move horizontally in x direction          
    @xmax = 6
    # max number of tiles we can move (upwards) in y direction
    @ymax = 10

# can we reach platform p2 starting from platform p1?  assume
# currently for simplicity that no platforms 'block' the path from p1
# -> p2.
canReachPlatform = (p1, p2, physics) ->
  # check we can get there horizontally first
  leftx = p1.xleft - physics.xmax
  rightx = p1.xright + physics.xmax
  if p2.overlap leftx, rightx
    # can we simply drop onto the platform?
    if p2.y > p1.y
      return true
    # can we jump onto it?
    if p2.y + physics.ymax > p1.y
      return true
  false

module.exports.PlatformGraph = class PlatformGraph
  constructor: (level) ->

    platforms = @_getPlatforms level

    # create PhysicsFinder object that will enable us to create the
    # platform graph.
    physics = new PhysicsFinder()

    neighbors = []
    for i in [0..platforms.length - 1]
      pneighs = []
      p1 = platforms[i]
      for j in [0..platforms.length - 1]
        if i != j
          p2 = platforms[j]
          # can we reach platform p2 *directly* starting from p1 under
          # the game physics? Note p2 -> p1 does not imply p1 -> p2
          # (i.e., we create a directed graph).
          if canReachPlatform p1, p2, physics
            pneighs.push(p2)
      neighbors.push(pneighs)
    @neighbors = neighbors
    console.log neighbors

  # return list of all platforms in level
  _getPlatforms: (level) ->
    # compute all platforms from the level data
    platforms = []
    xstart = null
    y = null
    for row in [0..level.rows - 1]
      for col in [0..level.cols - 1]
        t = level.tileToValue col, row
        if t in c.COLTILES and t != c.BTILE
          if (xstart == null)
            xstart = col
            y = row
        else # not a collision tile
          if (xstart != null)
            xend = col - 1
            # should check if this platform is fully or partially
            # 'covered' by other platforms before push
            platforms.push(new Platform(xstart, xend, y))
            # reset for next platform
            xstart = null
            
      # reached right hand side of screen, end platform if necessary
      if (xstart != null)
        xend = level.cols - 1
        platforms.push(new Platform(xstart, xend, y))        
        xstart = null
        
    platforms

# find path from entity1 to entity2 given a particular platform graph
module.exports.findpath = (entity1, entity2, pgraph) ->
  # figure out which platforms entity1 and entity2 are on
  pgraph
