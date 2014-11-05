c     = require './constants'
astar = require './astar'

_pgraph = null # the platform graph 
_path = null # the current path from enemy to player
_physics = null

# export the path for rendering
module.exports.path = null

module.exports.preProcess = (level) ->
  # the physics for this level
  _physics = new PhysicsFinder()
  console.log _physics
  # create graph that connects platforms
  _pgraph = new PlatformGraph(level)
  
# placeholder currently for relevant pathfinding physics.
class PhysicsFinder
  constructor: () ->
    # max number of tiles we can move horizontally in x direction          
    @xmax = 5
    # max number of tiles we can move (upwards) in y direction
    @ymax = 10

module.exports.render = (ctx) ->
  ctx.save()

  # draw numbers on each of the platforms
  ctx.font="30px white Georgia";
  ctx.fillStyle = "white"
  platforms = _pgraph.platforms
  for i in [0..platforms.length - 1]
    xt = (platforms[i].xleft + platforms[i].xright) / 2
    yt = platforms[i].y
    
    ctx.fillText(i, xt * c.TILE, yt * c.TILE)

  # draw the transition points between platforms
  if (_pgraph != null)
    # array of arrays (one array for each platform)
    jpoints = _pgraph.jumppoints
    neighbors = _pgraph.neighbors
    for i in [0..jpoints.length - 1]
      # array of points for each platform
      jp = jpoints[i]
      seen = {}
      for j in [0..jp.length - 1]
        # get the x tile on the platform
        xt = jp[j].x
        # get the y tile on the platform
        yt = platforms[i].y
        # mark fall points as red and jump points as green
        if jp[j].type == "fall"
          ctx.fillStyle = '#ff0000'
        else # .type is "jump"
          ctx.fillStyle = '#00ff00'
        # stack the y co-ord in case we have seen this point multiple times
        cx = xt * c.TILE
        cy = yt * c.TILE
        index = cx + "," + cy
        # have we seen this jump point already?
        if index in seen
          cy = cy + seen[index]*10
        #console.log seen
        seen[index] = if index in seen then seen[index] + 1 else 1
        
        ctx.fillRect(xt * c.TILE, yt * c.TILE, 4, 4)
        # write index of platform next to point
        ctx.fillText(neighbors[i][j].key(), xt * c.TILE + 10, yt * c.TILE)

  # draw the path from the enemy to the player
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 10;
  if _path != null and _path.length > 1
    ctx.beginPath()
    for i in [0.._path.length - 2]
      ctx.moveTo _path[i].midx() * c.TILE, _path[i].y * c.TILE
      ctx.lineTo _path[i + 1].midx() * c.TILE, _path[i + 1].y * c.TILE
    ctx.stroke()
    
  ctx.restore()

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

  # min and max x values can reach / can be reached from this platform
  xMax: () ->
    [Math.max(0, @xleft - _physics.xmax), Math.max(0, @xright + _physics.xmax)]

  # middle x tile
  midx: () ->
    (@xleft + @xright) / 2

  # is an x tile point within the platform?
  xInPlatform: (tx) ->
    if @xleft < tx and @xright > tx
      return true
    false

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

# can we reach platform p2 starting from platform p1?  assume
# currently for simplicity that no platforms 'block' the path from p1
# -> p2.
canReachPlatform = (p1, p2) ->
  # check we can get there horizontally first
  [leftx, rightx] = p1.xMax()
#  console.log p1.xleft, p1.xright, p2.xleft, p2.xright
  if p2.overlap leftx, rightx
    # can we simply drop onto the platform?
    if p2.y > p1.y
      #console.log "can drop from", p1.key(), "to", p2.key()
      return true
    # can we jump onto it?
    if p2.y + _physics.ymax > p1.y
      #console.log "can jump from", p1.key(), "to", p2.key()            
      return true
  false

# platform graph stores information on the platform linkage, including
# 'transition points' between platforms
PlatformGraph = class PlatformGraph
  constructor: (level) ->

    platforms = @_getAllPlatforms level

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
          if canReachPlatform p1, p2
            pneighs.push(p2)
      neighbors.push(pneighs)
    @platforms = platforms
    @neighbors = neighbors

    # create 'jump points' for pairs of platforms
    @jumppoints = @_getJumpPoints()

    console.log @neighbors
    console.log @jumppoints

  _getJumpPoints: () ->
    jumppoints = []
    for i in [0..@platforms.length - 1]
      p1 = @platforms[i]
      jp = [] # stores jump points for all neighbours of this platform
      for j in [0..@neighbors[i].length - 1]
        p2 = @neighbors[i][j]
        point = {}
        # if neighbouring platform is lower it is a fall point
        if p2.y > p1.y
          point.type = "fall"
          if p2.xleft < p1.xleft or p2.xInPlatform(p1.xleft)
            # can fall left (might also be able to fall right, but let's fall left)
            point.dir = "left"
            point.x = p1.xleft
          else if p2.xright > p1.xright or p2.xInPlatform(p1.xright)
            # can fall right
            point.dir = "right"
            point.x = p1.xright
          else # lower platform is contained within upper platform (case not yet handled)
            console.log "contained platform", p1.xleft, p1.xright, p2.xleft, p2.xright
        else # neighbouring platform is either level or above
          point.type = "jump"
          if p2.xleft > p1.xright
            point.dir = "right"
            point.x = p1.xright
          else if p2.xright < p1.xleft
            point.dir = "left"
            point.x = p1.xleft 
          else # neighbouring platform is 'partially or fully enclosed'
            [xleft, xright] = p2.xMax()
            console.log "jumping platform", xleft, xright, p2.xleft, p2.xright
            # if the region to the right hand side of p2 overlaps p1, we want to jump left
            if p1.overlap(p2.xright, xright)
              point.dir = "left"
              for x in [p2.xright + 2..xright]
                if p1.xInPlatform x
                  point.x = x
                  break
            # not sure why else not allowed here
            if p1.overlap(xleft, p2.xleft)
              point.dir = "right"
              for x in [p2.xleft - 2..xleft] by -1
                if p2.xInPlatform x
                  point.x = x
                  break
        # add the point
        jp.push point
      
      # add all points to the list
      jumppoints.push jp
    jumppoints

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
  _path = a.findPath(_pgraph.platforms[pnum1], _pgraph.platforms[pnum2])
  _path
