c = require './constants'


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


module.exports = RigidBodyMixin
