COLOR =
  GREEN: '#33CC66'
  BLUE: '#0066CC'
  BLACK: '#000000'
  WHITE: '#FFFFFF'
  YELLOW: '#ECD078'
  BRICK: '#D95B43'
  HOT_PINK: '#FF3399'
  PINK: '#C02942'
  PURPLE: '#542437'
  GREY: '#333'
  SLATE: '#53777A'
  GOLD: 'gold'
  LBLUE: '#20BFF5'

TILE = 32
FPS  = 60

module.exports =
  TILE: TILE         # the size of each tile (in game pixels)
  METER    : TILE    # abitrary choice for 1m
  WTILE    : 6       # value of water tile 
  GRAVITY  : 9.8 * 6 # default (exagerated) gravity
  MAXDX    : 15      # default max horizontal speed (15 tiles per second)
  MAXDY    : 60      # default max vertical speed   (60 tiles per second)
  ACCEL    : 1 / 2   # default take 1/2 second to reach maxdx (horizontal acceleration)
  FRICTION : 1 / 6   # default take 1/6 second to stop from maxdx (horizontal friction)
  IMPULSE  : 1500    # default player jump impulse
  COLOR: COLOR
  COLORS: [
    COLOR.YELLOW
    COLOR.BRICK
    COLOR.PINK
    COLOR.PURPLE
    COLOR.GREY
    COLOR.LBLUE
  ]
  KEY:
    CTRL    : 17
    SPACE   : 32
    LEFT    : 83
    UP      : 69
    RIGHT   : 70
    DOWN    : 68
    GUNUP   : 38
    GUNDOWN : 40
  STEP: 1 / FPS
