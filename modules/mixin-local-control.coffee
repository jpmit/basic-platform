c        = require './constants'
events   = require 'events'
screen   = require './screen'
v2Sub    = require './v2-subtract'
v2Unit   = require './v2-unit'
viewport = require './viewport'


class LocalControlMixin
  constructor: ->
    @left = false
    @right = false
    @jump = false 
    @emitter = new events.EventEmitter()

    # unit vector representing aim direction
    @aim =
      x: 0
      y: 0

    @cursorOffset =
      x: 0
      y: 0


  getAimVector: (event) ->
    target =
      x: screen.toCanvas(event.clientX) + viewport.offset.x
      y: screen.toCanvas(event.clientY) + viewport.offset.y

    shoulder =
      x: @x + @width/2
      y: @y + @height/2

    aim = v2Sub target, shoulder
    v2Unit aim


  mouseDown: (event) ->
    @emitter.emit 'fire', { x: @aim.x, y: @aim.y }


  mouseMove: (event) ->
    @aim = @getAimVector event

    aimX = screen.toCanvas(event.clientX) + viewport.offset.x
    aimY = screen.toCanvas(event.clientY) + viewport.offset.y

    @cursorOffset =
      x: aimX - @x
      y: aimY - @y

    @arm_angle = Math.atan2(@aim.y, @aim.x) * 180 / Math.PI
    @emitter.emit 'aim', { x: @aim.x, y: @aim.y }


  mouseUp: ->


  on: (event, listener) -> @emitter.on event, listener


  onKey: (ev, key, down) ->
    switch key
      when c.KEY.LEFT
        ev.preventDefault()
        @left = down
        return false
      when c.KEY.RIGHT
        ev.preventDefault()
        @right = down
        return false
      when c.KEY.UP
        ev.preventDefault()
        @up = down
        return false
      when c.KEY.DOWN
        ev.preventDefault()
        @down = down
        return false
      when c.KEY.SPACE or c.KEY.UP
        ev.preventDefault()
        @jump = down
        if down
          @emitter.emit 'jump'
        return false
      when c.KEY.TOGGLE_WEAPON
        ev.preventDefault()
        if down
          @armed = not @armed
          if @armed
            @emitter.emit 'unholster'
          else
            @emitter.emit 'holster'
        return false


module.exports = LocalControlMixin
