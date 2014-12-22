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

# ai controller for entity1 (typically monster) 'chasing' entity2
# (typically player)
class AiController
  constructor: (@entity1, @entity2) ->
    # platform indices that tell us which platform entity1 and entity2
    # *were last seen on* (they may not actually be currently on these
    # platforms, since one entity may be e.g. mid jump)
    @p1Index = null
    @p2Index = null
    # path from entity1 to entity2
    @path = null
    @reachedTransitionPoint = false
    @transPoint = null
    @transX = null

  # set navigation of entity1 when on same platform as entity2
  setNavigationOnPlatform: ->
    if (@entity2.x > @entity1.x)
      @entity1.right = true
      @entity1.left = false
    else
      @entity1.left = true
      @entity1.right = false

  # navigate to the transition point at co-ord x
  toTransitionPoint: (transX) ->
    if transX > @entity1.x
      @entity1.right = true
    else if transX < @entity1.x
      @entity1.left = true

  # are we at the transition point?
  atTransitionPoint: (transX) ->
    # the constant here ensures we don't 'jiggle' back and forth
    return (@entity1.x > transX - 3) and (@entity1.x < transX + 3)

  # set navigation of entity1 when on different platform to entity2
  setNavigationToPlatform: ->
    if (!@reachedTransitionPoint)
      if @atTransitionPoint(@transX)
        @entity1.x = @transX
        @entity1.dx = 0
        @entity1.right = false
        @entity1.left = false
        @reachedTransitionPoint = true;
        # set up the platform controller to jump to next platform!
        @pController = new PathController(@entity1, @transPoint)
      else
        # move towards the transition point
        @toTransitionPoint(@transX)
    else
      @pController.step()

  step: (pgraph) ->
    # figure out which platforms entity1 and entity2 are on
    p1Index = pgraph.getPlatformIndexForEntity @entity1
    p2Index = pgraph.getPlatformIndexForEntity @entity2
    #console.log p1Index, p2Index
    # only perform pathfinding if at least one platform has changed
    if (p1Index != @p1Index) or (p2Index != @p2Index)
      # indices can be null if entity not on platform
      if (p1Index != null and p2Index != null)
        # compute new path from entity1 to entity2
        p2Pos = pgraph.getEntityPosForPlatform @entity2
        @path = pgraph.findpath @entity1, p2Pos
        @reachedTransitionPoint = false
        @p1Index = p1Index
        @p2Index = p2Index
        if (@path.length > 1)
          # get transition point to next platform
          thisPlatform = @path[0]
          nextPlatform = @path[1]
          @transPoint = pgraph.getTransitionPoint thisPlatform.key(), nextPlatform.key()
          @transX = @transPoint.getXCoord()

    # set controls of entity1 for later simplicity
    @entity1.left = false
    @entity1.right = false
    @entity1.jump = false

    # path can be null at start of level only (before both entities
    # have touched ground once)
    if (@path != null)
      if (@path.length == 1)
        @setNavigationOnPlatform()
      else
        @setNavigationToPlatform()

module.exports = WaypointController
