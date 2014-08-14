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
monster = null
bullet = null

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
    when c.KEY.SPACE
      ev.preventDefault()
      player.jump = down
      return false
    when c.KEY.UP
      ev.preventDefault()
      player.up = down
      return false
    when c.KEY.DOWN
      ev.preventDefault()
      player.down = down
      return false
    when c.KEY.CTRL
      ev.preventDefault()
      player.firing = down
      return false

setup = ->
  level_data = JSON.parse fs.readFileSync(__dirname+'/level.json', 'utf8')
  level = new Level level_data
  canvas.width = level.width
  canvas.height = level.height
  player = physics.setupEntity level_data.layers[1].objects[0]
  monster = physics.setupEntity level_data.layers[1].objects[1]

frame = ->
  now = time()
  dt = dt + Math.min(1, (now - last) / 1000)

  # check if player firing bullet
  if player.firing and (!bullet)
    bullet = {rect: {x: player.rect.x, y: player.rect.y, width: 20, height: 100}, dx: 500, dy: -400}
    bullet.angle = Math.atan(bullet.dx / -bullet.dy);
  
  while dt > c.STEP
    dt = dt - c.STEP
    physics.updateEntity player, level, c.STEP
    physics.updateEntity monster, level, c.STEP
    if bullet
      if physics.updateBullet bullet, level, c.STEP
        bullet = null              
      if physics.bulletCollide bullet, monster
        bullet = null              
    physics.monsterCollide player, monster
    
  render ctx, player, monster, bullet, level
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
