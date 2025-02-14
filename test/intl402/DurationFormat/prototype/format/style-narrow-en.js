// Copyright 2022 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-Intl.DurationFormat.prototype.format
description: Test if format method formats duration correctly with different "style" arguments
locale: [en-US]
features: [Intl.DurationFormat]
---*/

const style = "narrow";
const expected = "1y 2m 3w 3d 4h 5m 6s 7ms 8μs 9ns";

const duration = {
  years: 1,
  months: 2,
  weeks: 3,
  days: 3,
  hours: 4,
  minutes: 5,
  seconds: 6,
  milliseconds: 7,
  microseconds: 8,
  nanoseconds: 9,
};

const df = new Intl.DurationFormat("en", {style});
assert.sameValue(df.format(duration), expected, `Assert DurationFormat format output using ${style} style option`);
