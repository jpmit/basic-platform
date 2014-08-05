Level   = require './modules/level'
c       = require './modules/constants'
fs      = require 'fs'
physics = require './modules/physics'
raf     = require 'raf'
render  = require './modules/renderer'
time    = require './modules/time'


canvas = document.getElementById 'canvas'
ctx    = canvas.getContext '2d'
dt     = 0
now    = null
last   = time()
level = null
player = null


onkey = (ev, key, down) ->
  switch key
    when c.KEY.LEFT
      ev.preventDefault()
      player.left = down
      return false
    when c.KEY.RIGHT
      ev.preventDefault()
      player.right = down
      return false
    when c.KEY.SPACE or c.KEY.UP
      ev.preventDefault()
      player.jump = down
      return false


setup = ->
  level_data = JSON.parse fs.readFileSync(__dirname+'/level.json', 'utf8')
  level = new Level level_data
  canvas.width = level.width
  canvas.height = level.height
  player = physics.setupEntity level_data.layers[1].objects[0]


frame = ->
  now = time()
  dt = dt + Math.min(1, (now - last) / 1000)
  while dt > c.STEP
    dt = dt - c.STEP
    physics.updateEntity player, level, c.STEP
  
  render ctx, player, level
  last = now
  raf frame, canvas


document.addEventListener(
  'keydown'
  (ev) -> onkey ev, ev.keyCode, true
  false
)

document.addEventListener(
  'keyup'
  (ev) -> onkey(ev, ev.keyCode, false)
  false
)

setup()
frame()
