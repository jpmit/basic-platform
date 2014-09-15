Level   = require './modules/level'
c       = require './modules/constants'
fs      = require 'fs'
physics = require './modules/physics'
collide = require './modules/physics-collide'
raf     = require 'raf'
render  = require './modules/renderer'
time    = require './modules/time'
unitVector = require './modules/v2-unit'


canvas = document.getElementById 'canvas'
ctx    = canvas.getContext '2d'
dt     = 0
now    = null
last   = time()
level = null
player = null
monster = null
enemyEntities = []
gun = null
bullet = null
bulletUpdates = 3

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
    when c.KEY.CTRL
      ev.preventDefault()
      gun.firing = down
      return false
    when c.KEY.GUNUP
      ev.preventDefault()
      gun.up = down
    when c.KEY.GUNDOWN
      ev.preventDefault()
      gun.down = down


setup = ->
  level_data = JSON.parse fs.readFileSync(__dirname+'/level.json', 'utf8')
  level = new Level level_data
  canvas.width = level.width
  canvas.height = level.height
  player = physics.setupEntity level_data.layers[1].objects[0]
  monster = physics.setupEntity level_data.layers[1].objects[1]
  # added gun with rudimentary aiming with up and down arrow keys;
  # angle is in radians clockwise from horizontal
  gun = { angle: 0.001 , firing: false, sensitivity: 5}
  # list of all entities other than the player entity
  enemyEntities = [monster]


frame = ->
  now = time()
  dt = dt + Math.min(1, (now - last) / 1000)

  # check if player firing bullet  
  if gun.firing and (!bullet)
    bullet = {x: player.x, y: player.y, width: 10, height: 50, angle: gun.angle}
    bullet.dx = 400 * Math.sin(bullet.angle);
    bullet.dy = -400 * Math.cos(bullet.angle);
    # unit vector in the direction of bullet travel
    bullet.dir = unitVector({x: bullet.dx, y: bullet.dy})
    # unit vector perpendicular to direction of bullet travel
    bullet.perp = {x: bullet.dir.y, y: -bullet.dir.x}
  
  while dt > c.STEP
    dt = dt - c.STEP
    physics.updateEntity player, level, c.STEP
    for entity in enemyEntities
      physics.updateEntity entity, level, c.STEP
    # update the aiming of the gun
    physics.updateGun gun, c.STEP
    for _ in [1..bulletUpdates] by 1
      if bullet
        console.log _
        # did the bullet collide with the level or other entities?
        bulletCollides =  physics.updateBullet bullet, enemyEntities, level, c.STEP / bulletUpdates
        if bulletCollides.length > 0
          console.log bulletCollides      
          bullet = null
    # detect (and handle) collision between player and other entities
    for entity in enemyEntities
      collide.entityCollide player, entity
    
  render ctx, player, enemyEntities, gun, bullet, level
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
