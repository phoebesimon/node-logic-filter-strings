var test = require('tape');

var condition = require('../index.js').parseCondition;
var expression = require('../index.js').parseExpression;
var predicate = require('../index.js').parsePredicate;

test('simple condition', function(t) {
  t.deepEqual(
    condition('foo === "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality condition'
  );

  t.deepEqual(
    condition('foo == "bar"').value,
    ['foo', '==', 'bar'],
    'Loose equality condition'
  );

  t.deepEqual(
    condition('foo !== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality condition'
  );

  t.deepEqual(
    condition('foo != "bar"').value,
    ['foo', '!=', 'bar'],
    'Loose inequality condition'
  );

  t.deepEqual(
    condition('foo!=="bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality condition no spaces'
  );

  t.deepEqual(
    condition('foo==="bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality condition no spaces'
  );

  t.deepEqual(
    condition('foo!== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality condition asymetrical spaces'
  );

  t.deepEqual(
    condition('foo=== "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality condition asymetrical spaces'
  );

  t.deepEqual(
    condition("foo === 'bar'").value,
    ['foo', '===', 'bar'],
    'Strict equality condition with single quotes'
  );

  t.deepEqual(
    condition('foo == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    condition('"foo" == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values and quoted key'
  );

  t.deepEqual(
    condition('foo == {foo: "bar"}').value,
    ['foo', '==', {foo: 'bar'}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    condition('foo == {foo: "bar", baz: [1, 2, 3]}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3]}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    condition('foo == {foo: "bar", baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], "blue": "fish"}, green: "dog"}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], blue: "fish"}, green: 'dog'}],
    'Loose equality to array with mixed values'
  );

  t.end();
});
