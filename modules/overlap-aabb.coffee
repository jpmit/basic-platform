# true if two AABBs overlap

module.exports = overlapAABB = (b1, b2) ->
  not (((b1.x + b1.width) < b2.x) or
       ((b2.x + b2.width) < b1.x) or 
       ((b1.y + b1.height) < b2.y) or 
       ((b2.y + b2.height) < b1.y))
