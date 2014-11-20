# modified from http://bennolan.com/2011/04/11/astar-in-coffeescript.html
module.exports.Astar = class AStar
  constructor: ->
    @openNodes = {} # List of openNodes nodes (nodes to be inspected)
    @closedNodes = {} # List of closedNodes nodes (nodes we've already inspected)

    # The maximum potential trip length we would consider
    @maxHeuristic = 100000#Point.origin().squareDistanceTo(new Point(5, 5))

  findPath: (start, destination) ->
    # g = 0 #Cost from start to current node
    # h = heuristic(start, destination) #Cost from current node to destination
    # var f = g+h #Cost from start to destination going through the current node

    start.f = @heuristic(start, destination)
  
    # Push the start node onto the list of openNodes nodes
    # openNodes.push(start) 
    @openNodes[start.key()] = start

    #Keep going while there's nodes in our openNodes list
    while @openNodes
      #Find the best openNodes node (lowest f value)

      #Alternately, you could simply keep the openNodes list sorted by f value lowest to highest,
      #in which case you always use the first node

      node = { f : Infinity }

      for key, n of @openNodes
        if n.f < node.f
          node = n
  
      # No nodes remain in openNodes
      if node.f == Infinity
        # No path could be found...
        #console.log "No path could be found"
        return null
        # console.log @closedNodes
  
      # Check if we've reached our destination
      if node.equals(destination)
        path = [destination]
  
        while (node != start) # && (node.parentKey)
          node = @closedNodes[node.parentKey]
          path.push node

        path.reverse()
    
        return path
    
      # Remove the current node from our openNodes list
      delete @openNodes[node.key()]

      # Push it onto the closedNodes list
      @closedNodes[node.key()] = node

      # Expand our current node
      for n in node.neighbors when (!@closedNodes[n.key()]) && (!@openNodes[n.key()]) 
        # console.log(n.key())
        n.f = @heuristic(n, destination)
        n.parentKey = node.key()
    
        # Prevent really long paths
        if n.f < @maxHeuristic
          @openNodes[n.key()] = n
        # else 
        #   @closedNodes[n.key()] = n

  # An A* heurisitic must be admissible, meaning it must never overestimate the
  # distance to the goal. In other words, it must either underestimate or return 
  # exactly the distance to the goal.
  heuristic: (a, b) ->
    a.heuristicDistance(b)
