# collide two entities, each of which has a hitbox which is an AABB
module.exports.collideEntity = (entity1, entity2) ->
  h1 = entity1.hitbox
  h2 = entity2.hitbox
  isCollision = not (((h1.x + h1.width) < h2.x) or
                     ((h2.x + h2.width) < h1.x) or 
                     ((h1.y + h1.height) < h2.y) or 
                     ((h2.y + h2.height) < h1.y))
  # if we have a collision, replace entity1 so that there is no longer a collision
  if isCollision
    if h1.x + h1.width > h2.x
      entity1.hitbox.x = h1.x -  (h1.x + h1.width - h2.x)
    else if h1.x < h2.x + h2.width
      entity1.hitbox.x = h1.x + (h2.x + h2.width - h1.x)
    if h1.y + h1.height > h2.y
      entity2.hitbox.y = h1.y - (h1.y + h1.height - h2.y)
    else if h1.y < h2.y + h2.height
      entity2.hitbox.y = h1.y + (h2.y + h2.height - h1.y)

  entity1.hitbox.y = entity1.hitbox.y +  (entity1.hitbox.y - entity2.hitbox.y)
  
  isCollision
