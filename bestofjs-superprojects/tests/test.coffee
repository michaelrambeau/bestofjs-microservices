test = require 'tape'
{dateOnly, getTimeValue, createPoint, createAllPoints, createDailyDeltas, pointsToDeltas} = require './superprojects'

# Mock snapshots (/project/55ab9d0f8f937d03008d41c4)
mockSnapshots = require './data/snapshots'

test 'testing getTimeValue() function', (assert) ->
  dates = [
    t0: '2015-05-26T21:33:05.882Z',
    t1: '2015-05-26T20:33:05.882Z',
    delta: 0
  ,
    t0: '2015-05-26T21:33:05.882Z',
    t1: '2015-05-27T21:33:05.882Z',
    delta: 1
  ]

  checkDifference = (t0, t1, delta) ->
    # Create Date object from db timestamps
    d0 = new Date(t0)
    d1 = new Date(t1)

    # Keep only the date part
    # dateOnly0 = dateOnly(d0)
    # dateOnly1 = dateOnly(d1)

    # Comparing the dates
    actual = getTimeValue(d0) - getTimeValue(d1)
    expected = delta
    assert.equal actual, expected, "should return the right time difference (#{expected} days)."
    true

  for item in dates
    checkDifference item.t0, item.t1, item.delta
  assert.end()

test 'Parsing N snapshots', (assert) ->
  points = createAllPoints mockSnapshots
  actual = points.length
  expected = mockSnapshots.length
  assert.equal actual, expected, "should return an array of same length"

  points.forEach (point) ->
    if Number.isNaN(point.t)
      assert.fail('point.t should be a number!')
    if Number.isNaN(point.stars)
      assert.fail('point.stars should be a number!')

  # check that time increments by one
  reducer = (pointA, pointB) ->
    if pointB.t isnt pointA.t + 1
      assert.fail('Time sequence is broken!')
    return pointB

  points.reduce reducer,
    t: - 1

  deltas = pointsToDeltas points

  assert.ok(Array.isArray(deltas), 'Daily deltas should be an array')
  actual = deltas.length
  expected = points.length - 1
  assert.equal(actual, expected, 'Daily deltas should be an array of N - 1 elements')

  #console.log deltas

  assert.end()

test 'Checking edge cases', (assert) ->
  snapshots = []
  deltas = createDailyDeltas snapshots
  console.log deltas
  actual = deltas.length
  expected = 0
  assert.equal(actual, expected, 'No snapshots => daily deltas should be an empty array')

  snapshots = mockSnapshots[0]
  console.log deltas
  actual = deltas.length
  expected = 0
  assert.equal(actual, expected, 'Only one snapshot => daily deltas should be an empty array')

  assert.end()
