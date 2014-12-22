pathfinder = require './physics-pathfinder'
c          = require './constants'

# class to control an entity moving between two platforms
class PathController
  constructor: (@entity, @tPoint) ->
    @njumps = 0
    @justJumped = false;
    @njumpsNeeded = @tPoint.njump
    # co-ords to: always target the 'corner' of the platform
    if (@tPoint.dir == pathfinder.DIR_LEFT)
      @xTo = @tPoint.p2.xright * c.TILE
    else if (@tPoint.dir == pathfinder.DIR_RIGHT)
      @xTo = @tPoint.p2.xleft * c.TILE
    @yTo = @tPoint.p2.y * c.TILE

  step: ->
    # vertical motion
    if (@justJumped)
      @entity.jump = false
    if (!@entity.jumping) # on the way down
      if (@njumps < @njumpsNeeded) # jump again
        @makeJump()

    # horizontal motion: the + 100 here means that we don't hit the
    # platform from underneath
    if (@xTo < @entity.x)
      if (@entity.y < @yTo) or (@xTo + 100 < @entity.x)
        @entity.left = true
    else
      if (@entity.y < @yTo) or (@xTo + 100 > @entity.x)            
        @entity.right = true

  makeJump: ->
    @entity.jump = true
    @justJumped = true
    @njumps += 1

# ai controller for entity following a set of waypoints
class AiWaypointController
  constructor: (@entity, @pointList) ->
    # platform indices that tell us which platform entity
    # *was last seen on* (may not actually be currently on these
    # platforms, since one entity may be e.g. mid jump)
    @pIndex = null
    # path from entity to next waypoint
    @path = null
    @reachedTransitionPoint = false
    @transPoint = null
    @transX = null
    # current waypoint
    @currPoint = @pointList[0]
    @currPointIndex = 0

  # set navigation of entity1 when on same platform as entity2
  setNavigationOnPlatform: ->
    if (currPoint.x > @entity.x)
      @entity.right = true
      @entity.left = false
    else
      @entity.left = true
      @entity.right = false

  # navigate to the transition point at co-ord x
  toTransitionPoint: (transX) ->
    if transX > @entity.x
      @entity.right = true
    else if transX < @entity.x
      @entity.left = true

  # are we at the transition point?
  atTransitionPoint: (transX) ->
    # the constant here ensures we don't 'jiggle' back and forth
    return (@entity.x > transX - 3) and (@entity.x < transX + 3)

  atWayPoint: (wayX) ->
    return @atTransitionPoint wayX

  # set navigation of entity1 when on different platform to entity2
  setNavigationToPlatform: ->
    if (!@reachedTransitionPoint)
      if @atTransitionPoint(@transX)
        @entity.x = @transX
        @entity.dx = 0
        @entity.right = false
        @entity.left = false
        @reachedTransitionPoint = true;
        # set up the platform controller to jump to next platform!
        @pController = new PathController(@entity, @transPoint)
      else
        # move towards the transition point
        @toTransitionPoint(@transX)
    else
      @pController.step()

  step: (pgraph) ->
    # have we reached the current waypoint?
    if (@atWayPoint(@currPoint.x))
      if (@currPointIndex == @pointList.length - 1)
        # we reached the end of the waypoint sequence
        return
      else
        # head to the next transition point
        @currPointIndex = @currPointIndex + 1
        @currPoint = @pointList[@currPointIndex]

    # figure out which platform entity is on
    pIndex = pgraph.getPlatformIndexForEntity @entity
    # figure out which platform waypoint is on
    wIndex = pgraph.getPlatformIndexForPosition @currPoint
    # only perform pathfinding if at least one platform has changed
    if (pIndex != @pIndex) or (wIndex != @wIndex)
      # indices can be null if entity not on platform
      if (pIndex != null and wIndex != null)
        # compute new path from entity1 to entity2
        @path = pgraph.findpath @entity, @currPoint
        @reachedTransitionPoint = false
        @pIndex = pIndex
        @wIndex = wIndex
        if (@path.length > 1)
          # get transition point to next platform
          thisPlatform = @path[0]
          nextPlatform = @path[1]
          @transPoint = pgraph.getTransitionPoint thisPlatform.key(), nextPlatform.key()
          @transX = @transPoint.getXCoord()

    # set controls of entity1 for later simplicity
    @entity.left = false
    @entity.right = false
    @entity.jump = false

    # path can be null at start of level only (before both entities
    # have touched ground once)
    if (@path != null)
      if (@path.length == 1)
        @setNavigationOnPlatform()
      else
        @setNavigationToPlatform()

module.exports = AiWaypointController
