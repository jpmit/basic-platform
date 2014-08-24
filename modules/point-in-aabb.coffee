# true if point is inside the entity's hitbox
module.exports = pointInAABB = (point, box) ->
  ((point.x > box.x) and (point.x < box.x + box.width) and
   (point.y > box.y) and (point.y < box.y + box.height))
