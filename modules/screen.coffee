# screen utilities

module.exports.leftTop = (el) ->
  x = parseInt el.offsetLeft, 10
  y = parseInt el.offsetTop, 10
  element = el.offsetParent
  while element isnt null
      x += parseInt(element.offsetLeft,10)
      y += parseInt(element.offsetTop,10)
      element = element.offsetParent
  [ x, y ]

module.exports.ratio = window.devicePixelRatio or 1

module.exports.scale_factor = 1

# convert screen coordinate to canvas coordinate
module.exports.toCanvas = (screenX) ->
  screenX * (module.exports.ratio / module.exports.scale_factor)
