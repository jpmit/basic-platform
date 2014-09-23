clamp = require './clamp'
sign  = require './sign'


# http://noonat.github.io/intersect/#aabb-vs-segment

###
determine if a line segment intersects a bounding box
aabb is has pos, which is the center point of the bounding box and half, which is the radius of the box on each axis
pos is the x,y position of the start of the line segment
delta is the length of the line segment in 2 directions
###
module.exports = intersectSegment = (aabb, pos, delta, paddingX=0, paddingY=0) ->
  scaleX = 1.0 / delta.x
  scaleY = 1.0 / delta.y
  signX = sign scaleX
  signY = sign scaleY
  nearTimeX = (aabb.pos.x - signX * (aabb.half.x + paddingX) - pos.x) * scaleX
  nearTimeY = (aabb.pos.y - signY * (aabb.half.y + paddingY) - pos.y) * scaleY
  farTimeX = (aabb.pos.x + signX * (aabb.half.x + paddingX) - pos.x) * scaleX
  farTimeY = (aabb.pos.y + signY * (aabb.half.y + paddingY) - pos.y) * scaleY

  if nearTimeX > farTimeY or nearTimeY > farTimeX
    return null

  nearTime = if nearTimeX > nearTimeY then nearTimeX else nearTimeY
  farTime = if farTimeX < farTimeY then farTimeX else farTimeY

  if nearTime >= 1 or farTime <= 0
    return null

  ###
  hit.pos is the point of contact between the two objects (or an estimation of it, in some sweep tests).
  hit.normal is the surface normal at the point of contact.
  hit.delta is the overlap between the two objects, and is a vector that can be added to the colliding object’s position to move it back to a non-colliding state.
  hit.time is a fraction from 0 to 1 indicating how far along the line the collision occurred. (This is the t value for the line equation L(t) = A + t * (B - A))
  ###
  hit =
    collider : aabb
    pos      : { x: 0, y: 0 }
    delta    : { x: 0, y: 0 }
    normal   : { x: 0, y: 0 }
    time     : clamp nearTime, 0, 1

  if nearTimeX > nearTimeY
    hit.normal.x = -signX
    hit.normal.y = 0
  else
    hit.normal.x = 0
    hit.normal.y = -signY
  hit.delta.x = hit.time * delta.x
  hit.delta.y = hit.time * delta.y
  hit.pos.x = pos.x + hit.delta.x
  hit.pos.y = pos.y + hit.delta.y
  return hit
