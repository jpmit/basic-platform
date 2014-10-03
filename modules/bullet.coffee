uuid = require 'node-uuid'


class Bullet
  # dir is the unit vector indicating projectile travel direction
  constructor: (@time, @x, @y, @dir, @color, @velocity=700, @damage='standard') ->
    @id = uuid.v4()
    @type = 'bullet'
    @levelid = null
    @ownerid = null
    @active = true
    @width = 8
    @height = 1
    @dx = @velocity * @dir.x
    @dy = @velocity * @dir.y

    # unit vector perpendicular to direction of bullet travel
    @perp =
      x: @dir.y
      y: -@dir.x


module.exports = Bullet
