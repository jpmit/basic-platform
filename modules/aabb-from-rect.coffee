# convert a rectangle (x, y, width, height) to an AABB bounding box in the
# format that the AABB is in (pos and half)

module.exports = toAABB = (rect) ->
  aabb =
    pos: { x: rect.x + rect.width/2, y:  rect.y + rect.height/2 }
    half: { x: rect.width/2, y: rect.height/2 }  
