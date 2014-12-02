# a 2D grid implemented backed with a 1D array

# TODO: research byte array with view for more efficient storage
# TODO: support cell as vector (e.g., some arrays store a single value, some store rgba, some store xyz, etc.)

class Grid2D
  constructor: (@cols=0, @rows=0, @cells=[]) ->
    length = @cols * @rows
    if length and (@cells.length is 0)
      @cells.push(0) for l in [1..length]


  floodFill: (col, row, val) ->
    cells = []
    visited = {}
    cells.push { col: col, row: row, val: @tileToValue(col, row) }
    while cells.length
      cell = cells.pop()
      if not visited["#{cell.col},#{cell.row}"]
        visited["#{cell.col},#{cell.row}"] = true
        if cell.val is 0
          @cells[cell.col + (cell.row * @cols)] = val
          neighbors = @_getNeighbors cell.col, cell.row
          cells.push(neighbor) for neighbor in neighbors


  # non-destructively resize the 1d array
  resizeGrid: (rows, cols) ->
    rowDelta = @rows - rows
    colDelta = @cols - cols

    if rowDelta > 0
      # remove rows
      howMany = @cols * rowDelta
      startIdx = @cells.length - howMany
      @cells.splice startIdx, howMany

    else if rowDelta < 0
      # add new rows
      @cells.push(0) for i in [-1..rowDelta*@cols]

    if colDelta > 0
      # remove columns
      howMany = colDelta
      for row in [@rows-1..0]
        startIdx = (row * @cols) + (@cols - howMany)
        @cells.splice startIdx, howMany

    else if colDelta < 0
      # add columns
      howMany = -colDelta
      for row in [@rows-1..0]
        startIdx = (row * @cols) + @cols
        for i in [1..howMany]
          @cells.splice startIdx, 0, 0
          startIdx++

    @cols = cols
    @rows = rows


  # gets a subset of items from a 1d array
  subset: (offset) ->
    result = []
    for y in [offset.y..offset.y+offset.height-1]
      for x in [offset.x..offset.x+offset.width-1]
        # 4 bytes per cell (rgba)
        idx = x + (@cols * y)
        result.push @cells[idx]
    result


  # get the value at the given cell
  # e.g., tileTovalue(0, 1) returns the value at col 0, row 1
  tileToValue: (col, row) -> @cells[col + (row * @cols)]


  _getNeighbors: (col, row) ->
    cells = []
    if col > 0
      cells.push { col: col-1, row: row, val: @tileToValue(col-1, row) }
    if col < @cols - 1
      cells.push { col: col+1, row: row, val: @tileToValue(col+1, row) }
    if row > 0
      cells.push { col: col, row: row-1, val: @tileToValue(col, row-1) }
    if row < @rows - 1
      cells.push { col: col, row: row+1, val: @tileToValue(col, row+1) }
    cells


module.exports = Grid2D


