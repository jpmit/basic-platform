# screen utilities

module.exports.ratio = window.devicePixelRatio or 1

module.exports.scale_factor = 1

# convert screen coordinate to canvas coordinate
module.exports.toCanvas = (screenX) ->
  screenX * (module.exports.ratio / module.exports.scale_factor)
