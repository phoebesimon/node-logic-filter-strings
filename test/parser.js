var test = require('tape');

var parser = require('../lib/parser');

test('simple condition', function(t) {
  t.deepEqual(
    parser.condition.parse('foo === "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality parser.condition.parse'
  );

  t.deepEqual(
    parser.condition.parse('foo == "bar"').value,
    ['foo', '==', 'bar'],
    'Loose equality parser.condition.parse'
  );

  t.deepEqual(
    parser.condition.parse('foo !== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality parser.condition.parse'
  );

  t.deepEqual(
    parser.condition.parse('foo != "bar"').value,
    ['foo', '!=', 'bar'],
    'Loose inequality parser.condition.parse'
  );

  t.deepEqual(
    parser.condition.parse('foo!=="bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality parser.condition.parse no spaces'
  );

  t.deepEqual(
    parser.condition.parse('foo==="bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality parser.condition.parse no spaces'
  );

  t.deepEqual(
    parser.condition.parse('foo!== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality parser.condition.parse asymetrical spaces'
  );

  t.deepEqual(
    parser.condition.parse('foo=== "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality parser.condition.parse asymetrical spaces'
  );

  t.deepEqual(
    parser.condition.parse("foo === 'bar'").value,
    ['foo', '===', 'bar'],
    'Strict equality parser.condition.parse with single quotes'
  );

  t.deepEqual(
    parser.condition.parse('foo == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.condition.parse('"foo" == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values and quoted key'
  );

  t.deepEqual(
    parser.condition.parse('foo == {foo: "bar"}').value,
    ['foo', '==', {foo: 'bar'}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.condition.parse('foo == {foo: "bar", baz: [1, 2, 3]}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3]}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.condition.parse('foo == {foo: "bar", baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], "blue": "fish"}, green: "dog"}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], blue: "fish"}, green: 'dog'}],
    'Loose equality to array with mixed values'
  );

  t.end();
});


test('simple predicates', function(t) {
  t.deepEqual(
    parser.predicate.parse('qux').value,
    'qux',
    'Existence predicate'
  );

  t.deepEqual(
    parser.predicate.parse('!qux').value,
    '!qux',
    'Non-existance predicate'
  );

  t.deepEqual(
    parser.predicate.parse('foo == "baz"').value,
    ['foo', '==', 'baz'],
    'Condition predicate'
  );

  t.end();
});


test('simple expressions', function(t) {
  t.deepEqual(
    parser.expression.parse('!foo && bar').value,
    ['!foo', '&&', 'bar'],
    'foo does not exist and bar exists'
  );

  t.deepEqual(
    parser.expression.parse('foo || bar === "baz"').value,
    ['foo', '||', ['bar', '===', 'baz']],
    'foo exists or bar strictly equals baz'
  );

  t.deepEqual(
    parser.expression.parse('foo || bar === [1,2,3]').value,
    ['foo', '||', ['bar', '===', [1, 2, 3]]],
    'foo exists or bar strictly equals [1, 2, 3]'
  );

  t.end();
});


test('simple notted expressions', function(t) {
  t.deepEqual(
    parser.nottedExpression.parse('!(foo && bar)').value,
    ['!', ['foo', '&&', 'bar']],
    'if not foo and bar'
  );

  t.end();
});
