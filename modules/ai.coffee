pathfinder = require './pathfinder'

class AiController
  # ai controller for entity1 'chasing' entity2 (typically player)
  constructor: (@entity1, @entity2) ->
    @pgraph = pathfinder.getPlatformGraph()
    console.log 'platform graph'
    console.log @pgraph
    # platforms indices that tell us which platform entity1 and entity2 are on
    @p1Index = null
    @p2Index = null
    # path from entity1 to entity2
    @path = null

  # set navigation of entity1 when on same platform as entity2
  setNavigationOnPlatform: ->
    if (@entity2.x > @entity1.x)
      @entity1.right = true
      @entity1.left = false
    else
      @entity1.left = true
      @entity1.right = false

  # set navigation of entity1 when on different platform to entity2
  setNavigationToPlatform: ->
      console.log 'not on same platform!'
      # on different platform
      # platform the enemy is currently on
      thisPlatform = @path[0]
      nextPlatform = @path[1]
      # transition point from thisPlatform to nextPlatform
      tp = @pgraph.getTransitionPoint(thisPlatform.key(), nextPlatform.key())
      console.log tp
      # go to the transition point and then stop
      xTransition = tp.getXCoord()

      if (@entity1.jump)
        @entity1.jump = false
        
      # are we already at the transition point?  If so, we need to do
      # something a bit complicated
      if (@entity1.x == xTransition and @entity1.vx == 0)
        @entity1.jump = true
      else
        # we are not at the transition point, so move towards it!

        # don't jiggle around at the transition point, instead stop
        if (@entity1.x > xTransition - 3) and (@entity1.x < xTransition + 3)
          @entity1.x = xTransition
          @entity1.vx = 0
          @entity1.right = false
          @entity1.left = false
        else
          if xTransition > @entity1.x
            @entity1.right = true
            @entity1.left = false
          else if xTransition < @entity1.x
            @entity1.left = true
            @entity1.right = false

  step: ->
    # figure out which platforms entity1 and entity2 are on
    p1Index = @pgraph.getPlatformIndexForEntity(@entity1)
    p2Index = @pgraph.getPlatformIndexForEntity(@entity2)

    if (p1Index != @p1Index) or (p2Index != @p2Index)
      # indices can be null if entity not on platform
      if (p1Index != null and p2Index != null)
        # path is from entity1 to entity2
        @path = pathfinder.findpath @entity1, @entity2
    @p1Index = p1Index
    @p2Index = p2Index

    # path can be null at start of level only (before both entities have touched ground once)
    if (@path)
      # 'press' the movement keys for entity1 that will get it to entity2
      if (@path.length == 1)
        @setNavigationOnPlatform()
      else
        @setNavigationToPlatform()

module.exports = AiController
