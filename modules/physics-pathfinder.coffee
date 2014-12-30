c     = require './constants'
astar = require './astar'

# types of transition points
_TYPE_JUMP = "jump"
_TYPE_FALL = "fall"
# directions of transition points
_DIR_LEFT = "left"
_DIR_RIGHT = "right"

# placeholder currently for relevant pathfinding physics.
class PhysicsFinder
  constructor: () ->
    # max number of tiles we can move horizontally in x direction
    @xmax = 6
    # max number of tiles we can move (upwards) in y direction (with
    # any number of jumps)
    @ymax = 9
    @ymaxSingle = @ymax / 3

_path    = null # render ai path for debug purposes. delete later

# game physics information (only used in this module)
_physics = new PhysicsFinder()


# each platform has an id which is returned with @key(); the id is
# also an index into the platform graph.
class Platform
  constructor: (id, xleft, xright, y) ->
    @id = id
    # note these are tile and not pixel coords
    @xleft = xleft
    @xright = xright
    @y = y
    @neighbors = []

  # can we reach platform p2 starting from this platform?  assume
  # currently for simplicity that no platforms 'block' the path to p2.
  canReachPlatform: (p2) ->
    # check we can get there horizontally first
    [ leftx, rightx ] = @xMax()
    if p2.overlap leftx, rightx
      # can we simply drop onto the platform?
      if p2.y > @y
        return true
      # can we jump onto it?
      if p2.y + _physics.ymax > @y
        return true
    false

  equals: (p2) -> @key() == p2.key()

  # used in A* search
  heuristicDistance: (p2) ->
    # might need to think about this one a bit more
    dx = @midx() - p2.midx()
    dy = @y - p2.y
    dx * dx + dy * dy

  # used in A* search : key returns the id, which is equal to the
  # index at which the platform is located in the pgraph.platforms
  # array
  key: -> @id

  # middle x tile
  midx: ->
    (@xleft + @xright) / 2

  # does the platform's x position overlap with the range given?
  overlap: (xleft, xright) ->
    not (@xright < xleft or @xleft > xright)

  # is an x tile point within the platform?
  xInPlatform: (tx) ->
    if @xleft < tx and @xright > tx
      return true
    false

  # min and max x values can reach / can be reached from this platform
  xMax: ->
    [Math.max(0, @xleft - _physics.xmax), Math.max(0, @xright + _physics.xmax)]

  # is other platform (p2) 'enclosed' inside this platform? E.g.:
  # ------
  #   --
  # or
  #   --
  # ------
  isEnclosed: (p2) ->
    return (p2.xleft >= @xleft and p2.xright <= @xright)


# a transition point between platforms
class TransitionPoint
  constructor: (type, dir, tx, p1, p2, njump) ->
    @type = type
    @dir = dir
    # note tx is the tile co-ordinate
    @tx = tx
    # p1 and p2 are platforms from and to respectively
    @p1 = p1
    @p2 = p2
    # number of jumps needed to get from p1 to p2
    @njump = njump

  getXCoord: ->
    @tx * c.TILE


# is a potential platform obscured by the rest of the level?
# if it is obscured, we won't count it in the platform graph
# level is Level instance, plat is Platform instance
_platformIsObscured = (level, plat) ->
  # no part of the platform is obscured initially
  obscured = []
  for x in [plat.xleft..plat.xright]
    obscured.push false
  # check each x co-ord in turn
  index = 0
  for x in [plat.xleft..plat.xright]
    # only the three rows above can obscure the platform
    for y in [plat.y - 3..plat.y - 1]
      t = level.tileToValue x, y
      if t in c.COLTILES
        obscured[index] = true
    index = index + 1

  # if every single tile on the platform is obscured, return true
  nob = 0
  for i in [0..obscured.length - 1]
    if (obscured[i] == true)
      nob = nob + 1
  if (nob == obscured.length)
    return true

  # if we are here, at least one tile in the platform is not obscured
  # from above.

  # if left and/or right edges of platform are obscured, change the
  # platform left and right positions accordingly
  i = 0
  while (obscured[i] == true)
    i = i + 1
  plat.xleft = plat.xleft + i
  i = obscured.length - 1
  while (obscured[i] == true)
    i = i - 1
  rightpad = obscured.length - 1 - i
  plat.xright = plat.xright - rightpad

  # return false (the platform isn't completely obscured)
  false

# platform graph stores information on the platform linkage, including
# 'transition points' between platforms.
class PlatformGraph
  constructor: (level) ->
    @update level


  # find path from entity1 to destination given a particular platform graph
  findpath: (entity, destination) ->
    pnum1 = @getPlatformIndexForEntity entity
    pnum2 = @getPlatformIndexForPosition destination
    # we'll only try to find a path if both entities are currently on a platform
    if (pnum1 == null) or (pnum2 == null)
      return null
    # compute route from pnum1 to pnum2
    a = new astar.Astar
    _path = a.findPath @platforms[pnum1], @platforms[pnum2]


  # return the co-ordinate of an entity used to determine the platform the
  # entity is on.
  getEntityPosForPlatform: (entity) ->
    # warning: this assignment for the x tile the entity is on might
    # cause problems for player on edges of platform (far left edge in
    # particular)
    return { x: entity.x + entity.width / 2, y: entity.ytile * c.TILE }


  getPlatformIndexForEntity: (entity) ->
    if (not entity.onfloor)
      return null
    return @getPlatformIndexForPosition(@getEntityPosForPlatform(entity))


  getPlatformIndexForTilePosition: (tx, ty) ->
    # figure out which platform this tile co-ord is on.  note it might
    # be better to integrate this into the collision routine and store
    # the platform index for use here.
    for pnum in [0..@platforms.length - 1]
      p = @platforms[pnum]
      if (p.y == ty)
        if (tx >= p.xleft and tx <= p.xright)
          return pnum
    # we didn't find the platform
    null


  getPlatformIndexForPosition: (pos) ->
    # convert position to a tile co-ord
    ty = Math.floor(pos.y / c.TILE)
    tx = Math.floor(pos.x / c.TILE)
    return @getPlatformIndexForTilePosition(tx, ty)


  getTransitionPoint: (k1, k2) -> @transitionPoints[k1][k2]


  # rendering is currently for debugging
  render: (ctx) ->
    ctx.save()

    # draw numbers on each of the platforms
    ctx.font="30px white Georgia";
    ctx.fillStyle = "white"
    platforms = @platforms
    for i in [0..platforms.length - 1]
      xt = (platforms[i].xleft + platforms[i].xright) / 2
      yt = platforms[i].y
      ctx.fillText(i, xt * c.TILE, yt * c.TILE)

    # draw the transition points between platforms
    # array of arrays (one array for each platform)
    tpoints = @transitionPoints
    for i in [0..tpoints.length - 1]
      # array of points for each platform
      tp = tpoints[i]
      seen = {}
      for j in [0..tp.length - 1]
        if tp[j] != null
          # get the x tile on the platform
          xt = tp[j].tx
          # get the y tile on the platform
          yt = platforms[i].y
          # mark fall points as red and jump points as green
          if tp[j].type == "fall"
            ctx.fillStyle = '#ff0000'
          else # .type is "jump"
            ctx.fillStyle = '#00ff00'
          # stack the y co-ord in case we have seen this point multiple times
          cx = xt * c.TILE
          cy = yt * c.TILE
          index = cx + "," + cy
          # have we seen this jump point already?
          if index of seen
            cy = cy + seen[index] * c.TILE
            seen[index] = seen[index] + 1
          else
            seen[index] = 1
        
          ctx.fillRect(cx, cy, 4, 4)
          # write index of platform next to point
          ctx.fillText(@platforms[j].key(), cx, cy)

    # draw the path from the enemy to the player
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 10
    if _path != null and _path.length > 1
      ctx.beginPath()
      for i in [0.._path.length - 2]
        ctx.moveTo _path[i].midx() * c.TILE, _path[i].y * c.TILE
        ctx.lineTo _path[i + 1].midx() * c.TILE, _path[i + 1].y * c.TILE
      ctx.stroke()
    ctx.restore()


  update: (level) ->
    platforms = @_getAllPlatforms level
    for p1 in platforms
      for p2 in platforms
        if p1.id isnt p2.id
          # can we reach platform p2 *directly* starting from p1 under the game
          # physics? Note p2 -> p1 does not imply p1 -> p2 (i.e., we create a directed graph)
          # .
          if p1.canReachPlatform(p2)
            p1.neighbors.push p2
    @platforms = platforms

    # create 'transition points' for pairs of connected platforms
    @transitionPoints = @_getTransitionPoints()


  # return list of all platforms in level
  _getAllPlatforms: (level) ->
    # compute all platforms from the level data
    platforms = []
    xstart = null
    y = null
    # here we are assuming that the boundary of the level is a box
    # surrounding the level, hence the indices (we don't allow the
    # top row, or the two edge columns of the level to be part of
    # platforms).
    for row in [1..level.rows - 1]
      for col in [1..level.cols - 2]
        t = level.tileToValue col, row
        if t in c.COLTILES
          if (xstart == null)
            xstart = col
            y = row
        else # not a collision tile
          if (xstart != null)
            xend = col - 1
            newp = new Platform(platforms.length, xstart, xend, y)
            # reset for next platform
            xstart = null
            if (_platformIsObscured(level, newp) == false)
              platforms.push(newp)
            
      # reached right hand side of screen, end platform if necessary
      if (xstart != null)
        xend = level.cols - 2
        newp = new Platform(platforms.length, xstart, xend, y)
        xstart = null
        if (_PlatformIsObscured(level, newp) == false)
          platforms.push(plat)         
    platforms


  _getTransitionPoints: ->
    # first create an empty transitionPoints 'matrix', where
    # transitionPoints[k1][k2] is either null or a TransitionPoint
    transitionPoints = []
    for p1 in @platforms
      points = []
      points.push(null) for p2 in @platforms
      transitionPoints.push points

    # populate the matrix
    for p1 in @platforms
      tp = [] # stores transition points for all neighbours of this platform
      for p2 in p1.neighbors
        # if neighbouring platform is lower it is a fall point
        if p2.y > p1.y
          ptype = _TYPE_FALL
          if p2.xleft < p1.xleft or p2.xInPlatform(p1.xleft)
            # can fall left (might also be able to fall right, but let's fall left)
            pdir = _DIR_LEFT
            px = p1.xleft
          else if p2.xright > p1.xright or p2.xInPlatform(p1.xright)
            # can fall right
            pdir = _DIR_RIGHT
            px = p1.xright
          else # lower platform is contained within upper platform (case not yet handled)
            console.log "contained platform", p1.xleft, p1.xright, p2.xleft, p2.xright
        else # neighbouring platform is either level or above
          ptype = _TYPE_JUMP

          # how many jumps are needed? (either 1 or 2 currently)
          if p1.y > p2.y + 2 * _physics.ymaxSingle
            njumps = 3
          else if p1.y > p2.y + _physics.ymaxSingle
            njumps = 2
          else
            njumps = 1
            
          if p2.xleft > p1.xright
            pdir = _DIR_RIGHT
            px = p1.xright
          else if p2.xright < p1.xleft
            pdir = _DIR_LEFT
            px = p1.xleft
          else # neighbouring platform is 'partially or fully enclosed'
            [xleft, xright] = p2.xMax()
            console.log "enclosed platform", xleft, xright, p2.xleft, p2.xright
            # if the region to the right hand side of p2 overlaps p1, we want to jump left
            if p1.overlap(p2.xright, xright)
              pdir = _DIR_LEFT
              for x in [p2.xright + 2..xright]
                if p1.xInPlatform x
                  px = x
                  break
            else if p1.overlap(xleft, p2.xleft)
              pdir = _DIR_RIGHT
              for x in [p2.xleft - 2..xleft] by -1
                if p2.xInPlatform x
                  px = x
                  break
        # add the point
        transitionPoints[p1.key()][p2.key()] = new TransitionPoint(ptype, pdir, px, p1, p2, njumps || null)
    transitionPoints


# called in game setup (initialization)
module.exports.PlatformGraph = PlatformGraph

# these constants are needed by the ai module
module.exports.DIR_LEFT = _DIR_LEFT
module.exports.DIR_RIGHT = _DIR_RIGHT
