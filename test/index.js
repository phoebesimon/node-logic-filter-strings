var test = require('tape');

var logicFilterString = require('../index.js');


test('simple filters', function(t) {
  t.deepEqual(
    logicFilterString('foo === "bar"').value,
    ['foo', '===', 'bar'],
    'foo does not exist and bar exists'
  );
  t.deepEqual(
    logicFilterString('foo').value,
    ['foo'],
    'foo exists'
  );
  t.deepEqual(
    logicFilterString('foo && bar').value,
    [['foo'], '&&', ['bar']],
    'foo does not exist and bar exists'
  );

  t.deepEqual(
    logicFilterString('(foo === "bar" && bar === "baz") || qux === "foo"').value,
    [[['foo', '===', 'bar'], '&&', ['bar', '===', 'baz']], '||', ['qux', '===', 'foo']],
    'foo does not exist and bar exists'
  );

  t.deepEqual(
    logicFilterString('!foo && bar').value,
    [['!', ['foo']], '&&', ['bar']],
    'foo does not exist and bar exists'
  );

  t.deepEqual(
    logicFilterString('foo && !bar').value,
    [['foo'], '&&', ['!', ['bar']]],
    'foo exists and bar does not exist'
  );

  t.deepEqual(
    logicFilterString('!foo && !bar').value,
    [['!', ['foo']], '&&', ['!', ['bar']]],
    'foo does not exist and bar does not exist'
  );

  t.deepEqual(
    logicFilterString('foo || bar === "baz"').value,
    [['foo'], '||', ['bar', '===', 'baz']],
    'foo exists or bar strictly equals baz'
  );

  t.deepEqual(
    logicFilterString('foo || bar === [1,2,3]').value,
    [['foo'], '||', ['bar', '===', [1, 2, 3]]],
    'foo exists or bar strictly equals [1, 2, 3]'
  );

  t.deepEqual(
    logicFilterString('!(foo && bar)').value,
    ['!', [['foo'], '&&', ['bar']]],
    'if not foo and bar'
  );

  t.deepEqual(
    logicFilterString('qux').value,
    ['qux'],
    'Existence predicate'
  );

  t.deepEqual(
    logicFilterString('!qux').value,
    ['!', ['qux']],
    'Non-existance predicate'
  );

  t.deepEqual(
    logicFilterString('foo == "baz"').value,
    ['foo', '==', 'baz'],
    'Condition predicate'
  );

  t.deepEqual(
    logicFilterString('foo === "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality logicFilterString'
  );

  t.deepEqual(
    logicFilterString('foo == "bar"').value,
    ['foo', '==', 'bar'],
    'Loose equality logicFilterString'
  );

  t.deepEqual(
    logicFilterString('foo !== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality logicFilterString'
  );

  t.deepEqual(
    logicFilterString('foo != "bar"').value,
    ['foo', '!=', 'bar'],
    'Loose inequality logicFilterString'
  );

  t.deepEqual(
    logicFilterString('foo!=="bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality logicFilterString no spaces'
  );

  t.deepEqual(
    logicFilterString('(foo != "bar") && (baz != "qux")').value,
    ['!', [['foo', '==', 'bar'], '||', ['baz', '==', 'qux']]],
    'Demorgans and'
  );

  t.deepEqual(
    logicFilterString('foo != "bar" && baz != "qux"').value,
    ['!', [['foo', '==', 'bar'], '||', ['baz', '==', 'qux']]],
    'Demorgans and'
  );

  t.deepEqual(
    logicFilterString('(foo != "bar") || (baz != "qux")').value,
    ['!', [['foo', '==', 'bar'], '&&', ['baz', '==', 'qux']]],
    'Demorgans or'
  );

  t.deepEqual(
    logicFilterString('((foo != "bar") || (baz != "qux")) && foo').value,
    [['!', [['foo', '==', 'bar'], '&&', ['baz', '==', 'qux']]], '&&', ['foo']],
    'Demorgans or and foo'
  );

  t.deepEqual(
    logicFilterString('foo || ((foo != "bar") || (baz != "qux"))').value,
    [['foo'], '||', ['!', [['foo', '==', 'bar'], '&&', ['baz', '==', 'qux']]]],
    'foo or Demorgans or'
  );

  t.deepEqual(
    logicFilterString('foo==="bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality logicFilterString no spaces'
  );

  t.deepEqual(
    logicFilterString('foo!== "bar"').value,
    ['foo', '!==', 'bar'],
    'Strict inequality logicFilterString asymetrical spaces'
  );

  t.deepEqual(
    logicFilterString('foo=== "bar"').value,
    ['foo', '===', 'bar'],
    'Strict equality logicFilterString asymetrical spaces'
  );

  t.deepEqual(
    logicFilterString("foo === 'bar'").value,
    ['foo', '===', 'bar'],
    'Strict equality logicFilterString with single quotes'
  );

  t.deepEqual(
    logicFilterString('foo == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    logicFilterString('"foo" == [1,2,"3"]').value,
    ['foo', '==', [1, 2, "3"]],
    'Loose equality to array with mixed values and quoted key'
  );

  t.deepEqual(
    logicFilterString('foo == {foo: "bar"}').value,
    ['foo', '==', {foo: 'bar'}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    logicFilterString('foo == {foo: "bar", baz: [1, 2, 3]}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3]}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    logicFilterString('foo == {foo: "bar", baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], "blue": "fish"}, green: "dog"}').value,
    ['foo', '==', {foo: 'bar', baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], blue: "fish"}, green: 'dog'}],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    logicFilterString('foo.bar == "baz"').value,
    ['foo.bar', '==', 'baz'],
    'Dot notation condition'
  );

  t.deepEqual(
    logicFilterString('foo.bar == 42').value,
    ['foo.bar', '==', 42],
    'Int value'
  );

  t.deepEqual(
    logicFilterString('foo.bar == 42.42').value,
    ['foo.bar', '==', 42.42],
    'Decimal value'
  );

  t.deepEqual(
    logicFilterString('foo.bar == .42').value,
    ['foo.bar', '==', .42],
    'Decimal value'
  );

  t.end()
});

test('complex filters', function(t) {
  t.deepEqual(
    logicFilterString('!(foo && bar) && (baz == "qux" || qux == "foo")').value,
    [['!', [['foo'], '&&', ['bar']]], '&&', [['baz', '==', 'qux'], '||', ['qux', '==', 'foo']]],
    'if (not foo and bar) and ((baz equals qux) or (qux equals foo))'
  );

  t.deepEqual(
    logicFilterString('!(foo && bar == "baz")').value,
    ['!', [['foo'], '&&', ['bar', '==', 'baz']]],
    'if not (foo and bar equals baz)'
  );

  t.deepEqual(
    logicFilterString('!(foo === "baz")').value,
    ['!', ['foo', '===', 'baz']],
    'if not (foo strictly equals baz)'
  );

  t.deepEqual(
    logicFilterString('(foo && bar) && !(baz == "qux" || qux == "foo")').value,
    [[['foo'], '&&', ['bar']], '&&', ['!', [['baz', '==', 'qux'], '||', ['qux', '==', 'foo']]]],
    'if foo and bar and not ((baz equals qux) or (qux equals foo))'
  );

  t.deepEqual(
    logicFilterString('!(foo && bar)').value,
    ['!',[['foo'], '&&', ['bar']]],
    'not (foo and bar)'
  );

  t.deepEqual(
    logicFilterString('(foo && bar) && qux').value,
    [[['foo'], '&&', ['bar']], '&&', ['qux']],
    'if foo and bar and qux'
  );

  t.deepEqual(
    logicFilterString('!(foo && bar) && baz').value,
    [['!',[['foo'], '&&', ['bar']]], '&&', ['baz']],
    'if not(foo and bar) and baz'
  );

  t.deepEqual(
    logicFilterString('baz && !(foo && bar)').value,
    [['baz'], '&&', ['!',[['foo'], '&&', ['bar']]]],
    'if baz and not(foo and bar)'
  );

  t.deepEqual(
    logicFilterString('(bar && !(foo && bar)) && qux').value,
    [[['bar'], '&&', ['!', [['foo'], '&&', ['bar']]]], '&&', ['qux']],
    'if bar and not(foo and bar) and qux'
  );

  t.deepEqual(
    logicFilterString('(bar && (foo && bar)) && qux').value,
    [[['bar'], '&&', [['foo'], '&&', ['bar']]], '&&', ['qux']],
    'if bar and (foo and bar) and qux'
  );

  t.deepEqual(
    logicFilterString('foo && bar').value,
    [['foo'], '&&', ['bar']],
    'if foo and bar (no grouping)'
  );

  t.deepEqual(
    logicFilterString('foo || bar').value,
    [['foo'], '||', ['bar']],
    'if foo or bar (no grouping)'
  );

  t.deepEqual(
    logicFilterString('(foo && bar) || qux').value,
    [[['foo'], '&&', ['bar']], '||', ['qux']],
    'if (foo and bar) or qux'
  );

  t.deepEqual(
    logicFilterString('foo && (bar || qux)').value,
    [['foo'], '&&', [['bar'], '||', ['qux']]],
    'if foo and (bar or qux)'
  );

  t.deepEqual(
    logicFilterString('(foo && bar) || (baz && qux)').value,
    [[['foo'], '&&', ['bar']], '||', [['baz'], '&&', ['qux']]],
    'if (foo and bar) or (baz and qux)'
  );

  t.deepEqual(
    logicFilterString('!(foo) && bar').value,
    [['!', ['foo']], '&&', ['bar']],
    'if not (foo) && bar'
  );

  t.deepEqual(
    logicFilterString('foo && !(bar)').value,
    [['foo'], '&&', ['!', ['bar']]],
    'if foo and not (bar)'
  );

  t.deepEqual(
    logicFilterString('!(foo) && !(bar)').value,
    [['!', ['foo']], '&&', ['!', ['bar']]],
    'if not (foo) and not (bar)'
  );

  t.deepEqual(
    logicFilterString('!(foo && bar) || (baz && qux)').value,
    [['!', [['foo'], '&&', ['bar']]], '||', [['baz'], '&&', ['qux']]],
    'if not (foo and bar) or (baz and qux)'
  );

  t.deepEqual(
    logicFilterString('(foo && bar) || !(baz && qux)').value,
    [[['foo'], '&&', ['bar']], '||', ['!', [['baz'], '&&', ['qux']]]],
    'if (foo and bar) or not (baz and qux)'
  );

  t.deepEqual(
    logicFilterString('!(foo && bar) || !(baz && qux)').value,
    [['!', [['foo'], '&&', ['bar']]], '||', ['!', [['baz'], '&&', ['qux']]]],
    'if not (foo and bar) or not (baz and qux)'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" || bar === "qux"').value,
    [['foo', '===', 'baz'], '||', ['bar', '===', 'qux']],
    'if foo equals baz or bar equals qux'
  );

  t.deepEqual(
    logicFilterString('(foo === "baz") || (bar === "qux")').value,
    [['foo', '===', 'baz'], '||', ['bar', '===', 'qux']],
    'if (foo equals baz) or (bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('(foo === "baz" && bar === "qux") && a === "b"').value,
    [[['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']], '&&', ['a', '===', 'b']],
    'if foo equals baz and bar equals qux and a equals b'
  );

  t.deepEqual(
    logicFilterString('(foo === "baz" && bar === "qux") && a === "b"').value,
    [[['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']], '&&', ['a', '===', 'b']],
    'if (foo equals baz and bar equals qux) and a equals b'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" && (bar === "qux" && a === "b")').value,
    [['foo', '===', 'baz'], '&&', [['bar', '===', 'qux'], '&&', ['a', '===', 'b']]],
    'if foo equals baz and (bar equals qux and a equals b)'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" && ((bar === "qux"  || x === "y") && a === "b")').value,
    [['foo', '===', 'baz'], '&&', [[['bar', '===', 'qux'], '||', ['x', '===', 'y']], '&&', ['a', '===', 'b']]],
    'if foo equals baz and (bar equals qux or x equals y) and a equals b'
  );

  t.deepEqual(
    logicFilterString('!(foo === "baz") && bar === "qux"').value,
    [['!', ['foo', '===', 'baz']], '&&', ['bar', '===', 'qux']],
    'if not (foo equals baz) and bar equals qux'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" && !(bar === "qux")').value,
    [['foo', '===', 'baz'], '&&', ['!', ['bar', '===', 'qux']]],
    'if foo equals baz and !(bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('!(foo === "baz") && !(bar === "qux")').value,
    [['!', ['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]],
    'if !(foo equals baz) and !(bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('(!(foo === "baz") && !(bar === "qux")) && !(a === "b")').value,
    [[['!', ['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]], '&&', ['!', ['a', '===', 'b']]],
    'if !(foo equals baz) and !(bar equals qux) and !(a equals b)'
  );

  t.deepEqual(
    logicFilterString('(!(foo === "baz") && !(bar === "qux")) && !(a === "b")').value,
    [[['!', ['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]], '&&', ['!', ['a', '===', 'b']]],
    'if (!(foo equals baz) and !(bar equals qux)) and !(a equals b)'
  );

  t.deepEqual(
    logicFilterString('!(foo === "baz" && bar === "qux") || !(a === "b")').value,
    [['!', [['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']]], '||', ['!', ['a', '===', 'b']]],
    'if !(foo equals baz and bar equals qux) or !(a equals b)'
  );

  t.deepEqual(
    logicFilterString('!(foo === "baz" && bar === "qux") || a === "b"').value,
    [['!', [['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']]], '||', ['a', '===', 'b']],
    'if !(foo equals baz and bar equals qux) and a equals b'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" && !(bar === "qux" || a === "b")').value,
    [['foo', '===', 'baz'], '&&', ['!', [['bar', '===', 'qux'], '||', ['a', '===', 'b']]]],
    'if foo equals bar and (not (bar equals qux) or (a equals b))'
  );

  t.deepEqual(
    logicFilterString('(foo === "baz" && !(bar === "qux"  || x === "y")) && a === "b"').value,
    [[['foo', '===', 'baz'], '&&', ['!', [['bar', '===', 'qux'], '||', ['x', '===', 'y']]]], '&&', ['a', '===', 'b']],
    'if (foo equals baz and not((bar equals qux) or (x equals y)) and a equals b'
  );

  t.deepEqual(
    logicFilterString('foo && bar === "baz"').value,
    [['foo'], '&&', ['bar', '===', 'baz']],
    'if foo and bar equals baz'
  );

  t.deepEqual(
    logicFilterString('bar === "baz" && foo').value,
    [['bar', '===', 'baz'], '&&', ['foo']],
    'if bar equals baz and foo'
  );

  t.deepEqual(
    logicFilterString('foo && (bar === "baz")').value,
    [['foo'], '&&', ['bar', '===', 'baz']],
    'if foo and (bar equals baz)'
  );

  t.deepEqual(
    logicFilterString('(bar === "baz") && foo').value,
    [['bar', '===', 'baz'], '&&', ['foo']],
    'if (bar equals baz) and foo'
  );

  t.deepEqual(
    logicFilterString('!foo && (bar === "baz")').value,
    [['!', ['foo']], '&&', ['bar', '===', 'baz']],
    'if not foo and (bar equals baz)'
  );

  t.deepEqual(
    logicFilterString('(bar === "baz") && !foo').value,
    [['bar', '===', 'baz'], '&&', ['!', ['foo']]],
    'if (bar equals baz) and not foo'
  );

  t.deepEqual(
    logicFilterString('foo && !(bar === "baz")').value,
    [['foo'], '&&', ['!', ['bar', '===', 'baz']]],
    'if foo and not(bar equals baz)'
  );

  t.deepEqual(
    logicFilterString('foo && !bar === "baz"').value,
    [['foo'], '&&', ['!', ['bar', '===', 'baz']]],
    'if foo and not(bar equals baz) (no parens)'
  );

  t.deepEqual(
    logicFilterString('!(bar === "baz") && foo').value,
    [['!', ['bar', '===', 'baz']], '&&', ['foo']],
    'if not(bar equals baz) and foo'
  );

  t.deepEqual(
    logicFilterString('bar === "baz" && (foo || baz)').value,
    [['bar', '===', 'baz'], '&&', [['foo'], '||', ['baz']]],
    'if bar equals baz and (foo or baz)'
  );

  t.deepEqual(
    logicFilterString('bar === "baz" && !(foo || baz)').value,
    [['bar', '===', 'baz'], '&&', ['!', [['foo'], '||', ['baz']]]],
    'if bar equals baz and not(foo or baz)'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" && (foo && bar === "qux")').value,
    [['foo', '===', 'baz'], '&&', [['foo'], '&&', ['bar', '===', 'qux']]],
    'if foo equals baz and (foo and bar equals baz)'
  );

  t.deepEqual(
    logicFilterString('foo === "baz" && (!foo && bar === "qux")').value,
    [['foo', '===', 'baz'], '&&', [['!', ['foo']], '&&', ['bar', '===', 'qux']]],
    'if foo equals baz and (not foo and bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('(foo === "baz" && foo) && bar === "qux"').value,
    [[['foo', '===', 'baz'], '&&', ['foo']], '&&', ['bar', '===', 'qux']],
    'if (foo equals baz and foo) and bar equals qux'
  );

  t.deepEqual(
    logicFilterString('(foo && foo === "baz") && (bar && bar === "qux")').value,
    [[['foo'], '&&', ['foo', '===', 'baz']], '&&', [['bar'], '&&', ['bar', '===', 'qux']]],
    'if (foo and foo equals baz) and (bar and bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('!(foo && foo === "baz") && (bar && bar === "qux")').value,
    [['!', [['foo'], '&&', ['foo', '===', 'baz']]], '&&', [['bar'], '&&', ['bar', '===', 'qux']]],
    'if not(foo and foo equals baz) and (bar and bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('(foo && foo === "baz") && !(bar && bar === "qux")').value,
    [[['foo'], '&&', ['foo', '===', 'baz']], '&&', ['!', [['bar'], '&&', ['bar', '===', 'qux']]]],
    'if (foo and foo equals baz) and not(bar and bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('!(foo && foo === "baz") && !(bar && bar === "qux")').value,
    [['!', [['foo'], '&&', ['foo', '===', 'baz']]], '&&', ['!', [['bar'], '&&', ['bar', '===', 'qux']]]],
    'if not(foo and foo equals baz) and not(bar and bar equals qux)'
  );

  t.deepEqual(
    logicFilterString('metrics.duration.valueI32===70').value,
    ['metrics.duration.valueI32', '===', 70],
    'if foo.bar.qux equals 70'
  );

  t.end();
});

test('negative filters', function(t) {
  t.error(logicFilterString('foo == "baz" &&').status, 'No rhs to expression');
  t.error(logicFilterString('&& bar').status, 'No lhs to expression');
  t.error(logicFilterString('&&').status, 'Only operator');
  t.error(logicFilterString('foo == "baz" ||').status, 'No rhs to expression');
  t.error(logicFilterString('|| bar').status, 'No lhs to expression');
  t.error(logicFilterString('||').status, 'Only operator');
  t.error(logicFilterString('(foo || bar').status, 'Missing close paren on grouped expression');
  t.error(logicFilterString('foo || bar)').status, 'Missing open paren on grouped expression');
  t.error(logicFilterString(')foo || bar(').status, 'Reversed parens on grouped expression');
  t.error(logicFilterString('^(foo || bar)').status, 'Invalid notted expression operator');
  t.error(logicFilterString('foo bar').status, 'Missing operator');
  t.error(logicFilterString('42 || foo').status, 'Invalid numeric key');
  t.error(logicFilterString('foo == baz').status, 'Unquoted value');
  t.error(logicFilterString('foo !=== "bar"').status, 'Incredible strict inequality');
  t.error(logicFilterString('foo ===! "bar"').status, 'Incredible strict reverse inequality');
  t.error(logicFilterString('(foo == bar').status, 'Mismatched parens');
  t.error(logicFilterString('foo == [1,2,3').status, 'Unclosed array');
  t.error(logicFilterString('foo == {baz: "qux"').status, 'Unclosed object');
  t.error(logicFilterString('foo == {baz: qux}').status, 'Unquoted object value');
  t.error(logicFilterString('^foo').status, 'Invalid existence operator');
  t.error(logicFilterString('!(foo == "baz"').status, 'Not condition missing closing paren');
  t.error(logicFilterString('!foo == "baz")').status, 'Not condition missing opening paren');
  t.error(logicFilterString('42 == "baz"').status, 'Invalid numeric key');
  t.error(logicFilterString('foo == baz').status, 'Unquoted value');
  t.error(logicFilterString('foo !=== "bar"').status, 'Incredible strict inequality');
  t.error(logicFilterString('foo ===! "bar"').status, 'Incredible strict reverse inequality');
  t.error(logicFilterString('(foo == bar').status, 'Mismatched parens');
  t.error(logicFilterString('foo == [1,2,3').status, 'Unclosed array');
  t.error(logicFilterString('foo == {baz: "qux"').status, 'Unclosed object');
  t.error(logicFilterString('foo == {baz: qux}').status, 'Unquoted object value');
  t.error(logicFilterString('foo == 42.').status, 'Incomplete decimal value');
  t.error(logicFilterString('!(foo) &&').status, 'Missing rhs of conjunction');
  t.error(logicFilterString('!foo !bar').status, 'Missing operator');
  t.error(logicFilterString('!(foo bar)').status, 'Missing operator within notted expression');
  t.error(logicFilterString('foo && bar && qux').status, 'Operators cannot share operands');
  t.error(logicFilterString('foo && !bar && qux').status, 'Operators cannot share operands');
  t.error(logicFilterString('foo == bar == qux').status, 'Cannot have triple equals');
  t.error(logicFilterString('(foo == bar) == qux').status, 'Conditions cannot equal values');
  t.end();
});
