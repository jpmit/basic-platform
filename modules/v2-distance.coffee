# 2D Vector distance

distanceToSquared = (v, tv) ->
  lengthSq sub(v, tv)

lengthSq = (v) ->
  v.x * v.x + v.y * v.y

sub = (v1, v2) ->
  obj =
    x: v1.x - v2.x
    y: v1.y - v2.y

module.exports =  (v, tv) ->
  Math.sqrt distanceToSquared(v, tv)
