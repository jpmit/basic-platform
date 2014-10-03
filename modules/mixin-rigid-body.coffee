c       = require './constants'
collide = require './physics-collide'
move    = require './physics-move'


# create a new physics object using some initial settings
class RigidBodyMixin
  constructor: (obj) ->
    obj.properties = obj.properties or {}

    # the AABB of the entity, and the x, y co-ordinate is the
    # top left of the AABB (stored in pixels).
    @x = obj.x
    @y = obj.y
    @width = obj.width
    @height = obj.height

    @dx = 0
    @dy = 0

    @gravity = c.METER * (obj.properties.gravity or c.GRAVITY)
    @maxdx   = c.METER * (obj.properties.maxdx or c.MAXDX)
    @maxdy   = c.METER * (obj.properties.maxdy or c.MAXDY)
    @impulse = c.METER * (obj.properties.impulse or c.IMPULSE)
    @accel   = @maxdx / (obj.properties.accel or c.ACCEL)
    @friction = @maxdx / (obj.properties.friction or c.FRICTION)
    @falling = false
    @jumping = false
    @onfloor = false

    @maxjumpcount = obj.maxjumpcount or 1
    @jumpcount = 0

    @left    = obj.properties.left
    @right   = obj.properties.right
    @jump    = null

    # added for water: all of these constants are 'made up' and probably
    # need to be adjusted.
    # accelaration due to buoyancy: if < gravity, entity will float
    @buoyancy = 0.95 * @gravity
    # reduced jump in water
    @wImpulse = 0.5 * c.METER * (obj.properties.impulse or c.IMPULSE)
    @inWater = false
    # can have different values of friction and accelaration when in water
    @wFriction = 2 * @friction
    @wAccel = 0.5 * @accel
    # multiple velocity by this when entering water
    @wVelRescale = 0.1

    # added for ladders
    @onLadder = false
    @ladderdx = 120
    @ladderdy = 120


  # run a physics update step on an entity.  We first get the x position
  # we want to move the entity to (this will update the velocity and
  # accelaration but not the position of the entity).  Then we move the
  # entity to the correct x position based on collisions with the level.
  stepRigidBody: (level, dt) ->
    currentlyInWater = @_inWater level
    @brokeWater = currentlyInWater and (not @inWater)
    @inWater = currentlyInWater

    if @_onLadder level
      if not @onLadder
        # first time on ladder
        @dy = 0
        @dx = 0
      @onLadder = true
    else
      @onLadder = false
    
    xnew = move.stepX this, level, dt
    collide.levelCollideX this, level, xnew

    ynew = move.stepY this, level, dt
    collide.levelCollideY this, level, ynew


  # entity is in water if center point is on water tile
  _inWater: (level) ->
    level.cellValue(@x + @width / 2, @y + @height / 2) == c.WTILE


  # entity is on ladder if its rigid body overlaps with the ladder tile
  _onLadder: (level) ->
    # get tile values at all four corners of rigid body and check if any are ladder tiles
    points = [[@x, @y],
              [@x + @width, @y],
              [@x, @y + @height],
              [@x + @width, @y + @height]]
    for i in [0..3] by 1
      p = points[i]
      if level.cellValue(p[0], p[1]) == c.LTILE
        return true
    return false


module.exports = RigidBodyMixin
