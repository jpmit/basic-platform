module.exports = ->
  if window? and window.performance and window.performance.now
    # https://developer.mozilla.org/en-US/docs/Web/API/Performance.now()
    # http://updates.html5rocks.com/2012/08/When-milliseconds-are-not-enough-performance-now
    # returns a double measuring milliseconds since page started with microsecond resolution
    # milliseconds.microseconds
    window.performance.now()
  else
    new Date().getTime() 
