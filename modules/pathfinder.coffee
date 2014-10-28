c     = require './constants'
astar = require './astar'

_pgraph = null

# export the path for rendering
module.exports.path = null

module.exports.preProcess = (level) ->
  # create graph that connects platforms
  _pgraph = new PlatformGraph(level)


class Platform
  constructor: (id, xleft, xright, y) ->
    @id = id
    # note these are tile and not pixel coords
    @xleft = xleft
    @xright = xright
    @y = y

  # does the platform's x position overlap with the range given?
  overlap: (xleft, xright) ->
    not (@xright < xleft or @xleft > xright)

  # middle x tile
  midx: () ->
    (@xleft + @xright) / 2

  # used in A* search
  key: () ->
    @id

  # used in A* search
  getAdjacentNodes: () ->
    _pgraph.getNeighbors(@id)

  # used in A* search
  heuristicDistance: (p2) ->
    # will need to think about this one a bit more
    dx = @midx() - p2.midx()
    dy = @y - p2.y
    dx * dx + dy * dy

  equals: (p2) ->
    @key() == p2.key()

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

PlatformGraph = class PlatformGraph
  constructor: (level) ->

    platforms = @_getAllPlatforms level

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
    @platforms = platforms
    @neighbors = neighbors

  # get neighbours for a particular platform index
  getNeighbors: (pnum) ->
    @neighbors[pnum]

  # return list of all platforms in level
  _getAllPlatforms: (level) ->
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
            platforms.push(new Platform(platforms.length, xstart, xend, y))
            # reset for next platform
            xstart = null
            
      # reached right hand side of screen, end platform if necessary
      if (xstart != null)
        xend = level.cols - 1
        platforms.push(new Platform(platforms.length, xstart, xend, y))
        xstart = null
        
    platforms

  getPlatformIndexForEntity: (entity) ->
    if (not entity.onfloor)
      return null
    ty = entity.ytile
    # warning: this assignment for the x tile the entity is on might
    # cause problems for player on edges of platform (far left edge in
    # particular)
    tx = Math.floor((entity.x  + entity.render_width / 2) / c.TILE)

    # figure out which platform entity is on.  note it might be better
    # to integrate this into the collision routine and store the
    # platform index for use here.
    for pnum in [0..@platforms.length - 1]
      p = @platforms[pnum]
      if (p.y == ty)
        if (tx >= p.xleft and tx <= p.xright)
          return pnum
    # we didn't find the platform
    null
    
# find path from entity1 to entity2 given a particular platform graph
module.exports.findpath = (entity1, entity2) ->
  pnum1 = _pgraph.getPlatformIndexForEntity(entity1)
  pnum2 = _pgraph.getPlatformIndexForEntity(entity2)
  # we'll only try to find a path if both entities are currently on a platform
  if (pnum1 == null) or (pnum2 == null)
    return null
  # compute route from pnum1 to pnum2
  a = new astar.Astar
  # return the path
  a.findPath(_pgraph.platforms[pnum1], _pgraph.platforms[pnum2])
