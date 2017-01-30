# flyd-mergeAll
[![Build Status](https://travis-ci.org/bertofer/flyd-mergeAll.svg?branch=master)](https://travis-ci.org/bertofer/flyd-mergeAll)

mergeAll implementation for flyd streams.

It flattens an Stream-of-streams, emitting each time any of the emitted streams emit a value. The parameter concurrency can be added to specify how many
streams will be emitting at same time. For instance, if concurrency is 1, the first stream will have to end in order for the second one to emit on the result stream.

`([Number] HighOrder-Stream) -> Stream`
Example without specifying concurrency (all can emit):
```javascript
a:           {--.-----.--.---.----------.--------}
               [1]   [4 5 6 7 8]      [1 2]
                        [2 4]
                            [3 5 7]
mergeAll(a): {--1-----4-5264738577-----1-2------}
```

Example with concurrency 1:
```javascript

a:                 {--.-----.--.---.----------.--------}
                     [1]   [4 5 6 7 8]       [1 2]
                              [2 4]
                                  [3 5 7]
mergeAll(1, a):    {--1-----4-5-6-7-8--7------1-2------}

```
## Usage
```javascript



```
