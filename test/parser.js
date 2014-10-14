var test = require('tape');

var condition = require('../lib/parser.js').condition;
var expression = require('../lib/parser.js').expression;
var predicate = require('../lib/parser.js').predicate;

test('simple condition', function(t) {
  t.deepEqual(
    condition.parse('foo === "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality condition.parse'
  );

  t.deepEqual(
    condition.parse('foo == "bar"').value,
    ['foo', '==', 'bar'],
    'Loose equality condition.parse'
  );

  t.deepEqual(
    condition.parse('foo !== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality condition.parse'
  );

  t.deepEqual(
    condition.parse('foo != "bar"').value,
    ['foo', '!=', 'bar'],
    'Loose inequality condition.parse'
  );

  t.deepEqual(
    condition.parse('foo!=="bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality condition.parse no spaces'
  );

  t.deepEqual(
    condition.parse('foo==="bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality condition.parse no spaces'
  );

  t.deepEqual(
    condition.parse('foo!== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality condition.parse asymetrical spaces'
  );

  t.deepEqual(
    condition.parse('foo=== "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality condition.parse asymetrical spaces'
  );

  t.deepEqual(
    condition.parse("foo === 'bar'").value,
    ['foo', '===', 'bar'],
    'Strict equality condition.parse with single quotes'
  );

  t.deepEqual(
    condition.parse('foo == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    condition.parse('"foo" == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values and quoted key'
  );

  t.deepEqual(
    condition.parse('foo == {foo: "bar"}').value,
    ['foo', '==', {foo: 'bar'}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    condition.parse('foo == {foo: "bar", baz: [1, 2, 3]}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3]}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    condition.parse('foo == {foo: "bar", baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], "blue": "fish"}, green: "dog"}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], blue: "fish"}, green: 'dog'}],
    'Loose equality to array with mixed values'
  );

  t.end();
});
