// Copyright (C) 2017 Mozilla Corporation.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-atomics.wake
description: >
  Test that Atomics.wake wakes all waiters on a location, but does not
  wake waiters on other locations.
features: [Atomics, BigInt, SharedArrayBuffer, TypedArray]
---*/

var WAKEUP = 0;                 // Waiters on this will be woken
var DUMMY = 1;                  // Waiters on this will not be woken
var RUNNING = 2;                // Accounting of live agents
var NUMELEM = 3;
var NUMAGENT = 3;

for (var i = 0; i < NUMAGENT; i++) {
$262.agent.start(`
$262.agent.receiveBroadcast(function(sab) {
  var i64a = new BigInt64Array(sab);
  Atomics.add(i64a, ${RUNNING}, 1);
  $262.agent.report("A " + Atomics.wait(i64a, ${WAKEUP}, 0));
  $262.agent.leaving();
});
`);
}

$262.agent.start(`
$262.agent.receiveBroadcast(function(sab) {
  var i64a = new BigInt64Array(sab);
  Atomics.add(i64a, ${RUNNING}, 1);
  // This will always time out.
  $262.agent.report("B " + Atomics.wait(i64a, ${DUMMY}, 0, 10));
  $262.agent.leaving();
});
`);

var i64a = new BigInt64Array(new SharedArrayBuffer(NUMELEM * BigInt64Array.BYTES_PER_ELEMENT));
$262.agent.broadcast(i64a.buffer);

// Wait for agents to be running.
waitUntil(i64a, RUNNING, NUMAGENT + 1);

// Then wait some more to give the agents a fair chance to wait.  If we don't,
// we risk sending the wakeup before agents are sleeping, and we hang.
$262.agent.sleep(50);

// Wake all waiting on WAKEUP, should be 3 always, they won't time out.
assert.sameValue(Atomics.wake(i64a, WAKEUP), NUMAGENT);

var rs = [];
for (var i = 0; i < NUMAGENT + 1; i++) {
  rs.push(getReport());
}
rs.sort();

for (var i = 0; i < NUMAGENT; i++) {
  assert.sameValue(rs[i], "A ok");
}
assert.sameValue(rs[NUMAGENT], "B timed-out");

function getReport() {
  var r;
  while ((r = $262.agent.getReport()) == null) {
    $262.agent.sleep(10);
  }
  return r;
}

function waitUntil(i64a, k, value) {
  var i = 0;
  while (Atomics.load(i64a, k) !== value && i < 15) {
    $262.agent.sleep(10);
    i++;
  }
  assert.sameValue(Atomics.load(i64a, k), value, "All agents are running");
}
