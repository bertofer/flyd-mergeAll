'strcit mode'
var flyd = require('flyd')
var mergeAll = require('../')
var assert = require('assert')

describe('mergeAll', function () {
  var stream1$, stream2$, stream3$, highOrderStream$, merged$;

  beforeEach(function() {
    stream1$ = flyd.stream()
    stream2$ = flyd.stream()
    stream3$ = flyd.stream()
    highOrderStream$ = flyd.stream()
  })

  it('Should emit all the values from the internal streams emited', function() {
    let result = []

    merged$ = mergeAll(highOrderStream$)

    highOrderStream$(stream1$)
    highOrderStream$(stream2$)
    highOrderStream$(stream3$)

    flyd.on(function(val) {
      result.push(val)
    }, merged$)

    stream1$(1)
    stream2$(2)
    stream3$(3)
    stream1$(4)

    assert.deepEqual(result, [1, 2, 3, 4])
  })

  it('Should apply concurrency 1', function () {
    let result = []

    merged$ = mergeAll(1, highOrderStream$)

    highOrderStream$(stream1$)
    highOrderStream$(stream2$)
    highOrderStream$(stream3$)

    flyd.on(function(val) {
      result.push(val)
    }, merged$)

    stream1$(1)
    stream2$(2) // should not be emited
    stream3$(3) // should not be emited

    stream1$(4)

    stream1$.end(true)

    stream3$(2) // should not be emited
    stream2$(5)

    assert.deepEqual(result, [1, 4, 5])
  })

  it('Should apply concurrency n', function () {
    let result = []

    merged$ = mergeAll(2, highOrderStream$)

    highOrderStream$(stream1$)
    highOrderStream$(stream2$)
    highOrderStream$(stream3$)

    flyd.on(function(val) {
      result.push(val)
    }, merged$)


    stream1$(1)
    stream2$(2)

    stream3$(3) // should not be emited

    stream1$(4)

    stream1$.end(true)

    stream3$(2)
    stream2$(5)


    assert.deepEqual(result, [1, 2, 4, 2, 5])
  })

  it('Should emit even if not all streams have emitted', function() {
    let result = []
    merged$ = mergeAll(highOrderStream$)

    highOrderStream$(stream1$)
    highOrderStream$(stream2$)

    flyd.on(function(val) {
      result.push(val)
    }, merged$)

    stream1$(1)

    assert.deepEqual(result, [1])
  })

  it('Should finish when the high order stream and the emitted ones have finished', function () {
    let result = []

    merged$ = mergeAll(highOrderStream$)

    highOrderStream$(stream1$)
    highOrderStream$(stream2$)

    flyd.on(function(val) {
      result.push(val)
    }, merged$)

    stream1$.end(true)

    stream2$(2)

    stream2$.end(true)

    assert.deepEqual(result, [2])
    assert.deepEqual(merged$.end(), undefined)

    highOrderStream$.end(true)

    assert.deepEqual(merged$.end(), true)
  })

  it('Should work if the streams are pushed asynchronously', function (done) {
    let result = []

    merged$ = mergeAll(highOrderStream$)

    highOrderStream$(stream1$)
    highOrderStream$(stream2$)

    flyd.on(function(val) {
      result.push(val)
    }, merged$)

    stream1$.end(true)

    stream2$(1)

    stream2$.end(true)

    assert.deepEqual(result, [1])
    assert.deepEqual(merged$.end(), undefined)

    setTimeout(function () {
      highOrderStream$(stream3$)
      stream3$(2)
      assert.deepEqual(result, [1, 2])
      done()
    }, 50)
  })
})
