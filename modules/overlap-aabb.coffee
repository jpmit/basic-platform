# true if two AABBs overlap

module.exports = overlapAABB = (box1, box2) ->
  h1 = box1.hitbox
  h2 = box2.hitbox
  not (((h1.x + h1.width) < h2.x) or
       ((h2.x + h2.width) < h1.x) or 
       ((h1.y + h1.height) < h2.y) or 
       ((h2.y + h2.height) < h1.y))
