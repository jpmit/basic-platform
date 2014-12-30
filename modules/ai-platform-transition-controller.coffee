pathfinder = require './physics-pathfinder'
c          = require './constants'

# class to control an entity moving from it's current position to a
# 'transition point' on another platform.  This class basically
# handles the jumping from one platform to another.
class PlatformTransitionController
  constructor: (@entity, @tPoint) ->
    @njumps = 0
    @justJumped = false
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

module.exports = PlatformTransitionController
