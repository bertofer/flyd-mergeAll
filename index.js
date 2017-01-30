var flyd = require('flyd')

function allStreamsFinished (highOrderStream$, streams) {
  if (!highOrderStream$.end()) return false
  for (var i = 0; i < streams.length; ++i) {
    if (!streams[i].end()) return false
  }
  return true
}

module.exports = function(concurrency, highOrderStream$) {
  if (flyd.isStream(concurrency)) {
    highOrderStream$ = concurrency
    concurrency = undefined
  }

  var streams = []
  var mergedAux$
  var mergedAllEnd$ = flyd.stream()
  var mergedAll$ = flyd.stream()

  flyd.on(function(stream$) {

    if(mergedAll$.end()) return

    streams.push(stream$)

    if (mergedAux$) mergedAux$.end(true)

    mergedAux$ = flyd.immediate(flyd.combine(function () {
      var streams = Array.prototype.slice.call(arguments, 0, arguments.length - 2)
      var changed = arguments[arguments.length - 1]
      var self = arguments[arguments.length - 2]

      var allowed = [] // The ones allowed to emit this time (based on concurrency)
      if (concurrency) {
        for (var i = 0; i < streams.length; ++i) {
          var stream = streams[i]
          if (!stream.end()) allowed.push(stream)
          if (allowed.length === concurrency) break
        }
      } else allowed = streams

      var changedVals = []
      for (var i = 0; i < changed.length; ++i) {
        if (~allowed.indexOf(changed[i])) {
          changedVals.push(changed[i]())
        }
      }

      return changedVals
    }, streams))

    flyd.on(function () {
      if (allStreamsFinished(highOrderStream$, streams)) {
        mergedAllEnd$(true)
      }
    }, stream$.end)

    flyd.on(function(val) {
      for (var i = 0; i < val.length; ++i) {
        mergedAll$(val[i])
      }
    }, mergedAux$)

  }, highOrderStream$)

  flyd.on(function () {
    if (allStreamsFinished(highOrderStream$, streams)) {
      mergedAllEnd$(true)
    }
  }, highOrderStream$.end)

  return flyd.endsOn(mergedAllEnd$, mergedAll$)
}