module.exports = unitVector = (v) ->
  dist = Math.sqrt((v.x * v.x) + (v.y * v.y))
  { x: v.x/dist, y: v.y/dist }
