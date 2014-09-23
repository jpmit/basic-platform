sign = require './sign'


# http://noonat.github.io/intersect/#aabb-vs-aabb

###
This test uses a separating axis test, which checks for overlaps between the
two boxes on each axis. If either axis is not overlapping, the boxes aren’t
colliding.

The function returns a Hit object, or null if the two static boxes do not
overlap, and gives the axis of least overlap as the contact point. That is, it
sets hit.delta so that the colliding box will be pushed out of the nearest edge
This can cause weird behavior for moving boxes, so you should use sweepAABB
instead for moving boxes.
###
module.exports = intersectAABB = (aabb, aabb2) ->
  dx = aabb2.pos.x - aabb.pos.x
  px = (aabb2.half.x + aabb.half.x) - Math.abs(dx)
  return null if px <= 0

  dy = aabb2.pos.y - aabb.pos.y
  py = (aabb2.half.y + aabb.half.y) - Math.abs(dy)
  return null if py <= 0

  ###
  hit.pos is the point of contact between the two objects (or an estimation of it, in some sweep tests).
  hit.normal is the surface normal at the point of contact.
  hit.delta is the overlap between the two objects, and is a vector that can be added to the colliding object’s position to move it back to a non-colliding state.
  ###
  hit =
    collider : aabb
    pos      : { x: 0, y: 0 }
    delta    : { x: 0, y: 0 }
    normal   : { x: 0, y: 0 }

  if px < py
    sx = sign dx
    hit.delta.x = px * sx
    hit.normal.x = sx
    hit.pos.x = aabb.pos.x + (aabb.half.x * sx)
    hit.pos.y = aabb2.pos.y
  else
    sy = sign dy
    hit.delta.y = py * sy
    hit.normal.y = sy
    hit.pos.x = aabb2.pos.x
    hit.pos.y = aabb.pos.y + (aabb.half.y * sy)
  return hit 
