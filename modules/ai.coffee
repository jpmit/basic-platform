pathfinder = require './pathfinder'

# class to control an entity moving between two platforms
class PathController
  constructor: (@entity, @tPoint) ->
    @njumps = 0
    @justJumped = false;
    # work out how many jumps (1, 2, or 3) needed
    @njumpsNeeded = @tPoint.njump
    console.log @tPoint.dir
  step: ->
    if (@justJumped)
      @entity.jump = false

    # very simple algo currently: we simply jump vertically upwards
    # (not going left or right) the required number of times, then at
    # the top of the jump we move left or right to get to the
    # platform.
    
    if (!@entity.jumping) # on the way down
      if (@njumps < @njumpsNeeded) # jump again
        @makeJump()
      else # move left or right to
        if @tPoint.dir == "left"
          @entity.left = true
        else if @tPoint.dir == "right"
          @entity.right = true

  makeJump: ->
    @entity.jump = true
    @justJumped = true
    @njumps += 1

# ai controller for entity1 (typically monster) 'chasing' entity2
# (typically player)
class AiController
  constructor: (@entity1, @entity2) ->
    @pgraph = pathfinder.getPlatformGraph()
    console.log 'platform graph'
    console.log @pgraph
    # platforms indices that tell us which platform entity1 and entity2 are on
    @p1Index = null
    @p2Index = null
    # path from entity1 to entity2
    @path = null

    @reachedTransitionPoint = false;

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
      @entity1.left = false
    else if transX < @entity1.x
      @entity1.left = true
      @entity1.right = false

  # are we at the transition point?
  atTransitionPoint: (transX) ->
    return (@entity1.x > transX - 3) and (@entity1.x < transX + 3)

  # go from transition point to next platform: p1 is platform from and
  # p2 is platform to
  toNextPlatform: (p1, p2) ->
    if (!@entity1.jump)
      @entity1.jump = true;
    else
      
    return false

  # set navigation of entity1 when on different platform to entity2
  setNavigationToPlatform: ->
    # on different platform
    # platform the enemy is currently on
    thisPlatform = @path[0]
    nextPlatform = @path[1]
    # transition point from thisPlatform to nextPlatform
    tp = @pgraph.getTransitionPoint(thisPlatform.key(), nextPlatform.key())
    transX = tp.getXCoord()

    if (!@reachedTransitionPoint)
      if @atTransitionPoint(transX)
        @entity1.x = transX
        @entity1.dx = 0
        @entity1.right = false
        @entity1.left = false
        @reachedTransitionPoint = true;
        # set up the platform controller to navigate to next platform!
        console.log 'new path controller!'
        @pController = new PathController(@entity1, tp)
      else
        @toTransitionPoint(transX)
    else
      @pController.step()

  step: ->
    # figure out which platforms entity1 and entity2 are on
    p1Index = @pgraph.getPlatformIndexForEntity(@entity1)
    p2Index = @pgraph.getPlatformIndexForEntity(@entity2)

    # only perform pathfinding if at least one platform has changed
    if (p1Index != @p1Index) or (p2Index != @p2Index)
      # indices can be null if entity not on platform
      if (p1Index != null and p2Index != null)
        # compute new path is from entity1 to entity2
        console.log p1Index, p2Index
        @path = pathfinder.findpath @entity1, @entity2
        @reachedTransitionPoint = false
        @p1Index = p1Index
        @p2Index = p2Index

    # set controls of entity1 (the one we are controlling) to false
    @entity1.left = false
    @entity1.right = false
    @entity1.jump = false

    # path can be null at start of level only (before both entities
    # have touched ground once)
    if (@path)
      # 'press' the movement keys for entity1 that will get it to entity2
      if (@path.length == 1)
        @setNavigationOnPlatform()
      else
        @setNavigationToPlatform()

module.exports = AiController
