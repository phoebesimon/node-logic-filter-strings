var test = require('tape');

var parser = require('../lib/parser2');


test('tokens', function(t) {
  t.equal(
    parser.tokens.key.parse('foobar').value,
    'foobar',
    'foobar is a valid key'
  );

  t.equal(
    parser.tokens.notKey.parse('!foobar').value,
    '!foobar',
    '!foobar is a valid not key'
  );

  t.equal(
    parser.tokens.key.parse('foo.bar').value,
    'foo.bar',
    'foo.bar is a valid key'
  );

  t.equal(
    parser.tokens.key.parse('"foo bar"').value,
    'foo bar',
    '"foo bar" is a valid key'
  );

  t.deepEqual(
    parser.tokens.pair.parse('key: [1,2,3]').value,
    ['key', [1, 2, 3]],
    'key: [1, 2, 3] is a valid pair'
  );

  t.deepEqual(
    parser.tokens.objectParse.parse('{foo: "bar", baz: [1,2], qux: {"bar": "fish"}}').value,
    {foo: 'bar', baz: [1, 2], qux: {bar: 'fish'}},
    '{foo: "bar", baz: [1,2], qux: {"bar": "fish"}} is a valid object'
  );

  t.deepEqual(
    parser.tokens.array.parse('[1, 2, 3, "foo"]').value,
    [1, 2, 3, 'foo'],
    '[1, 2, 3, "foo"] is a valid object'
  );

  t.deepEqual(
    parser.tokens.value.parse('{foo: "bar", baz: [1,2], qux: {"bar": "fish"}}').value,
    {foo: 'bar', baz: [1, 2], qux: {bar: 'fish'}},
    '{foo: "bar", baz: [1,2], qux: {"bar": "fish"}} is a valid value'
  );

  t.deepEqual(
    parser.tokens.value.parse('[1, 2, 3, "foo"]').value,
    [1, 2, 3, 'foo'],
    '[1, 2, 3, "foo"] is a valid value'
  );

  t.equal(
    parser.tokens.value.parse('"foo"').value,
    'foo',
    '"foo" is a valid value'
  );

  t.equal(
    parser.tokens.value.parse('42').value,
    42,
    '42 is a valid value'
  );

  t.equal(
    parser.tokens.value.parse('42.42').value,
    42.42,
    '42.42 is a valid value'
  );

  t.end();
});

test('negative tokens', function(t) {
  t.error(
    parser.tokens.array.parse('[1, 2, 3, "foo",]').status,
    'Array with extra comma'
  );
  t.error(
    parser.tokens.array.parse('[1, 2,, 3, "foo"]').status,
    'Array with extra comma 2'
  );
  t.end();
});


test('strings', function(t) {
  t.equal(parser.strings.lbrace.parse('{').value, '{', '{ is a valid lbrace');
  t.equal(parser.strings.rbrace.parse('}').value, '}', '} is a valid rbrace');
  t.equal(parser.strings.lbrack.parse('[').value, '[', '[ is a valid lbrack');
  t.equal(parser.strings.rbrack.parse(']').value, ']', '] is a valid rbrack');
  t.equal(parser.strings.lparen.parse('(').value, '(', '( is a valid lparen');
  t.equal(parser.strings.rparen.parse(')').value, ')', ') is a valid rparen');
  t.equal(parser.strings.colon.parse(':').value, ':', ': is a valid colon');
  t.equal(parser.strings.comma.parse(',').value, ',', ', is a valid comma');
  t.equal(parser.strings.and.parse('&&').value, '&&', '&& is a valid and operator');
  t.equal(parser.strings.or.parse('||').value, '||', '|| is a valid or operator');
  t.equal(parser.strings.not.parse('!').value, '!', '! is a valid not operator');
  t.equal(parser.strings.notEquals.parse('!=').value, '!=', '!= is a valid not equals operator');
  t.equal(parser.strings.notEquals.parse('!==').value, '!==', '!== is a valid not equals operator');
  t.equal(parser.strings.equals.parse('==').value, '==', '== is a valid equals operator');
  t.equal(parser.strings.equals.parse('===').value, '===', '=== is a valid equals operator');
  t.equal(parser.strings.number.parse('42').value, 42, '42 is a valid number');
  t.equal(parser.strings.decimal.parse('42.42').value, 42.42, '42.42 is a valid decimal');
  t.end();
});


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

  t.deepEqual(
    parser.condition.parse('foo.bar == "baz"').value,
    ['foo.bar', '==', 'baz'],
    'Dot notation condition'
  );

  t.deepEqual(
    parser.condition.parse('foo.bar == 42').value,
    ['foo.bar', '==', 42],
    'Int value'
  );

  t.deepEqual(
    parser.condition.parse('foo.bar == 42.42').value,
    ['foo.bar', '==', 42.42],
    'Decimal value'
  );

  t.deepEqual(
    parser.condition.parse('foo.bar == .42').value,
    ['foo.bar', '==', .42],
    'Decimal value'
  );

  t.end();
});


/*test('simple predicates', function(t) {
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
    [['!foo'], '&&', ['bar']],
    'foo does not exist and bar exists'
  );

  t.deepEqual(
    parser.expression.parse('foo || bar === "baz"').value,
    [['foo'], '||', ['bar', '===', 'baz']],
    'foo exists or bar strictly equals baz'
  );

  t.deepEqual(
    parser.expression.parse('foo || bar === [1,2,3]').value,
    [['foo'], '||', ['bar', '===', [1, 2, 3]]],
    'foo exists or bar strictly equals [1, 2, 3]'
  );

  t.end();
});


test('simple notted expressions', function(t) {
  t.deepEqual(
    parser.nottedExpression.parse('!(foo && bar)').value,
    ['!', [['foo'], '&&', ['bar']]],
    'if not foo and bar'
  );

  t.end();
});
*/
test('simple filters', function(t) {
  debugger;
  t.deepEqual(
    parser.filter.parse('foo === "bar"').value,
    [['foo', '===', 'bar']],
    'foo does not exist and bar exists'
  );
  console.log('BLAB: ', parser.filter.parse('foo'))
  t.deepEqual(
    parser.filter.parse('foo').value,
    ['foo'],
    'foo exists'
  );
  console.log('BLOB: ', parser.filter.parse('foo && bar'))
  t.deepEqual(
    parser.filter.parse('foo && bar').value,
    ['foo', '&&', 'bar'],
    'foo does not exist and bar exists'
  );

  console.log("BLAH", parser.filter.parse('(foo === "bar" && bar === "baz") || qux === "foo"'))
  t.deepEqual(
    parser.filter.parse('(foo === "bar" && bar === "baz") || qux === "foo"').value,
    [[['foo', '===', 'bar'], '&&', ['bar', '===', 'baz']], '||', ['qux', '===', 'foo']],
    'foo does not exist and bar exists'
  );
////////////////////////////////////////////
  t.deepEqual(
    parser.filter.parse('!foo && bar').value,
    [[['!foo'], '&&', ['bar']]],
    'foo does not exist and bar exists'
  );

  t.deepEqual(
    parser.filter.parse('foo && !bar').value,
    [[['foo'], '&&', ['!bar']]],
    'foo exists and bar does not exist'
  );

  t.deepEqual(
    parser.filter.parse('!foo && !bar').value,
    [[['!foo'], '&&', ['!bar']]],
    'foo does not exist and bar does not exist'
  );

  t.deepEqual(
    parser.filter.parse('foo || bar === "baz"').value,
    [[['foo'], '||', ['bar', '===', 'baz']]],
    'foo exists or bar strictly equals baz'
  );

  t.deepEqual(
    parser.filter.parse('foo || bar === [1,2,3]').value,
    [[['foo'], '||', ['bar', '===', [1, 2, 3]]]],
    'foo exists or bar strictly equals [1, 2, 3]'
  );

  t.deepEqual(
    parser.filter.parse('!(foo && bar)').value,
    [['!', [['foo'], '&&', ['bar']]]],
    'if not foo and bar'
  );

  t.deepEqual(
    parser.filter.parse('qux').value,
    ['qux'],
    'Existence predicate'
  );

  t.deepEqual(
    parser.filter.parse('!qux').value,
    ['!qux'],
    'Non-existance predicate'
  );

  t.deepEqual(
    parser.filter.parse('foo == "baz"').value,
    [['foo', '==', 'baz']],
    'Condition predicate'
  );

  t.deepEqual(
    parser.filter.parse('foo === "bar"').value,
    [['foo', '===', 'bar']],
    'Strict equality parser.filter.parse'
  );

  t.deepEqual(
    parser.filter.parse('foo == "bar"').value,
    [['foo', '==', 'bar']],
    'Loose equality parser.filter.parse'
  );

  t.deepEqual(
    parser.filter.parse('foo !== "bar"').value,
    [['foo', '!==', 'bar']],
    'Strict inequality parser.filter.parse'
  );

  t.deepEqual(
    parser.filter.parse('foo != "bar"').value,
    [['foo', '!=', 'bar']],
    'Loose inequality parser.filter.parse'
  );

  t.deepEqual(
    parser.filter.parse('foo!=="bar"').value,
    [['foo', '!==', 'bar']],
    'Strict inequality parser.filter.parse no spaces'
  );

  t.deepEqual(
    parser.filter.parse('foo==="bar"').value,
    [['foo', '===', 'bar']],
    'Strict equality parser.filter.parse no spaces'
  );

  t.deepEqual(
    parser.filter.parse('foo!== "bar"').value,
    [['foo', '!==', 'bar']],
    'Strict inequality parser.filter.parse asymetrical spaces'
  );

  t.deepEqual(
    parser.filter.parse('foo=== "bar"').value,
    [['foo', '===', 'bar']],
    'Strict equality parser.filter.parse asymetrical spaces'
  );

  t.deepEqual(
    parser.filter.parse("foo === 'bar'").value,
    [['foo', '===', 'bar']],
    'Strict equality parser.filter.parse with single quotes'
  );

  t.deepEqual(
    parser.filter.parse('foo == [1,2,"3"]').value,
    [['foo', '==', [1, 2, "3"]]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.filter.parse('"foo" == [1,2,"3"]').value,
    [['foo', '==', [1, 2, "3"]]],
    'Loose equality to array with mixed values and quoted key'
  );

  t.deepEqual(
    parser.filter.parse('foo == {foo: "bar"}').value,
    [['foo', '==', {foo: 'bar'}]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.filter.parse('foo == {foo: "bar", baz: [1, 2, 3]}').value,
    [['foo', '==', {foo: 'bar', baz: [1, 2, 3]}]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.filter.parse('foo == {foo: "bar", baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], "blue": "fish"}, green: "dog"}').value,
    [['foo', '==', {foo: 'bar', baz: [1, 2, 3], qux: {one: "fish", two: ["fish", "red", "fish"], blue: "fish"}, green: 'dog'}]],
    'Loose equality to array with mixed values'
  );

  t.deepEqual(
    parser.filter.parse('foo.bar == "baz"').value,
    [['foo.bar', '==', 'baz']],
    'Dot notation condition'
  );

  t.deepEqual(
    parser.filter.parse('foo.bar == 42').value,
    [['foo.bar', '==', 42]],
    'Int value'
  );

  t.deepEqual(
    parser.filter.parse('foo.bar == 42.42').value,
    [['foo.bar', '==', 42.42]],
    'Decimal value'
  );

  t.deepEqual(
    parser.filter.parse('foo.bar == .42').value,
    [['foo.bar', '==', .42]],
    'Decimal value'
  );

  t.end()
});

test('complex filters', function(t) {
  t.deepEqual(
    parser.filter.parse('!(foo && bar) && (baz == "qux" || qux == "foo")').value,
    [[['!', [['foo'], '&&', ['bar']]], '&&', [['baz', '==', 'qux'], '||', ['qux', '==', 'foo']]]],
    'if (not foo and bar) and ((baz equals qux) or (qux equals foo))'
  );

  t.deepEqual(
    parser.filter.parse('!(foo && bar == "baz")').value,
    [['!', [['foo'], '&&', ['bar', '==', 'baz']]]],
    'if not (foo and bar equals baz)'
  );

  t.deepEqual(
    parser.filter.parse('!(foo == "baz")').value,
    [['!', ['foo', '==', 'baz']]],
    'if not (foo strictly equals baz)'
  );

  t.deepEqual(
    parser.filter.parse('foo && bar && !(baz == "qux" || qux == "foo")').value,
    [[[['foo'], '&&', ['bar']], '&&', ['!', [['baz', '==', 'qux'], '||', ['qux', '==', 'foo']]]]],
    'if foo and bar and not ((baz equals qux) or (qux equals foo))'
  );

  t.deepEqual(
    parser.filter.parse('!(foo && bar)').value,
    [['!',[['foo'], '&&', ['bar']]]],
    'not (foo and bar)'
  );

  t.deepEqual(
    parser.filter.parse('foo && bar && qux').value,
    [[[['foo'], '&&', ['bar']], '&&', ['qux']]],
    'if foo and bar and qux'
  );

  t.deepEqual(
    parser.filter.parse('!(foo && bar) && baz').value,
    [[['!',[['foo'], '&&', ['bar']]], '&&', ['baz']]],
    'if not(foo and bar) and baz'
  );

  t.deepEqual(
    parser.filter.parse('baz && !(foo && bar)').value,
    [[['baz'], '&&', ['!',[['foo'], '&&', ['bar']]]]],
    'if baz and not(foo and bar)'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('bar && !(foo && bar) && qux').value,
    [[['bar'], '&&', ['!', [['foo'], '&&', ['bar']]]], '&&', ['qux']],
    'if bar and not(foo and bar) and qux'
  );

  //FAIL
  console.log(parser.filter.parse('bar && (foo && bar) && qux'));
  t.deepEqual(
    parser.filter.parse('bar && (foo && bar) && qux').value,
    [[[['bar'], '&&', [['foo'], '&&', ['bar']]], '&&', ['qux']]],
    'if bar and (foo and bar) and qux'
  );

  t.deepEqual(
    parser.filter.parse('foo && bar').value,
    [[['foo'], '&&', ['bar']]],
    'if foo and bar (no grouping)'
  );

  t.deepEqual(
    parser.filter.parse('foo || bar').value,
    [[['foo'], '||', ['bar']]],
    'if foo or bar (no grouping)'
  );

  t.deepEqual(
    parser.filter.parse('(foo && bar) || qux').value,
    [[[['foo'], '&&', ['bar']], '||', ['qux']]],
    'if (foo and bar) or qux'
  );

  t.deepEqual(
    parser.filter.parse('foo && (bar || qux)').value,
    [[['foo'], '&&', [['bar'], '||', ['qux']]]],
    'if foo and (bar or qux)'
  );

  t.deepEqual(
    parser.filter.parse('(foo && bar) || (baz && qux)').value,
    [[[['foo'], '&&', ['bar']], '||', [['baz'], '&&', ['qux']]]],
    'if (foo and bar) or (baz and qux)'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('!(foo) && bar').value,
    [[['!', ['foo']], '&&', ['bar']]],
    'if not (foo) && bar'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('foo && !(bar)').value,
    [['foo'], '&&', [['!', ['bar']]]],
    'if foo and not (bar)'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('!(foo) && !(bar)').value,
    [['!', ['foo']], '&&', [['!', ['bar']]]],
    'if not (foo) and not (bar)'
  );

  t.deepEqual(
    parser.filter.parse('!(foo && bar) || (baz && qux)').value,
    [[['!', [['foo'], '&&', ['bar']]], '||', [['baz'], '&&', ['qux']]]],
    'if not (foo and bar) or (baz and qux)'
  );

  t.deepEqual(
    parser.filter.parse('(foo && bar) || !(baz && qux)').value,
    [[[['foo'], '&&', ['bar']], '||', ['!', [['baz'], '&&', ['qux']]]]],
    'if (foo and bar) or not (baz and qux)'
  );

  t.deepEqual(
    parser.filter.parse('!(foo && bar) || !(baz && qux)').value,
    [[['!', [['foo'], '&&', ['bar']]], '||', ['!', [['baz'], '&&', ['qux']]]]],
    'if not (foo and bar) or not (baz and qux)'
  );

  t.deepEqual(
    parser.filter.parse('foo === "baz" || bar === "qux"').value,
    [[['foo', '===', 'baz'], '||', ['bar', '===', 'qux']]],
    'if foo equals baz or bar equals qux'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('(foo === "baz") || (bar === "qux")').value,
    [[['foo', '===', 'baz'], '||', ['bar', '===', 'qux']]],
    'if (foo equals baz) or (bar equals qux)'
  );

  t.deepEqual(
    parser.filter.parse('foo === "baz" && bar === "qux" && a === "b"').value,
    [[[['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']], '&&', [['a', '===', 'b']]]],
    'if foo equals baz and bar equals qux and a equals b'
  );

  t.deepEqual(
    parser.filter.parse('(foo === "baz" && bar === "qux") && a === "b"').value,
    [[[['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']], '&&', [['a', '===', 'b']]]],
    'if (foo equals baz and bar equals qux) and a equals b'
  );

  t.deepEqual(
    parser.filter.parse('foo === "baz" && (bar === "qux" && a === "b")').value,
    [[[['foo', '===', 'baz']], '&&', [['bar', '===', 'qux'], '&&', ['a', '===', 'b']]]],
    'if foo equals baz and (bar equals qux and a equals b)'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('foo === "baz" && (bar === "qux"  || x === "y") && a === "b"').value,
    [[[[['foo', '===', 'baz']], '&&', [['bar', '===', 'qux'], '||', ['x', '===', 'y']]], '&&', ['a', '===', 'b']]],
    'if foo equals baz and (bar equals qux or x equals y) and a equals b'
  );

  t.deepEqual(
    parser.filter.parse('!(foo === "baz") && bar === "qux"').value,
    [[['!', ['foo', '===', 'baz']], '&&', [['bar', '===', 'qux']]]],
    'if not (foo equals baz) and bar equals qux'
  );

  t.deepEqual(
    parser.filter.parse('foo === "baz" && !(bar === "qux")').value,
    [[[['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]]],
    'if foo equals baz and !(bar equals qux)'
  );

  t.deepEqual(
    parser.filter.parse('!(foo === "baz") && !(bar === "qux")').value,
    [[['!', ['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]]],
    'if !(foo equals baz) and !(bar equals qux)'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('!(foo === "baz") && !(bar === "qux") && !(a === "b")').value,
    [[[['!', ['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]], '&&', ['!', ['a', '===', 'b']]]],
    'if !(foo equals baz) and !(bar equals qux) and !(a equals b)'
  );

  //FAIL
  t.deepEqual(
    parser.filter.parse('(!(foo === "baz") && !(bar === "qux")) && !(a === "b")').value,
    [[[['!', ['foo', '===', 'baz']], '&&', ['!', ['bar', '===', 'qux']]], '&&', ['!', ['a', '===', 'b']]]],
    'if (!(foo equals baz) and !(bar equals qux)) and !(a equals b)'
  );

  t.deepEqual(
    parser.filter.parse('!(foo === "baz" && bar === "qux") || !(a === "b")').value,
    [[['!', [['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']]], '||', ['!', ['a', '===', 'b']]]],
    'if !(foo equals baz and bar equals qux) or !(a equals b)'
  );

  t.deepEqual(
    parser.filter.parse('!(foo === "baz" && bar === "qux") || a === "b"').value,
    [[['!', [['foo', '===', 'baz'], '&&', ['bar', '===', 'qux']]], '||', [['a', '===', 'b']]]],
    'if !(foo equals baz and bar equals qux) and a equals b'
  );

  t.end();
});

test('negative conditions', function(t) {
  t.error(parser.condition.parse('foo == baz').status, 'Unquoted value');
  t.error(parser.condition.parse('foo !=== "bar"').status, 'Incredible strict inequality');
  t.error(parser.condition.parse('foo ===! "bar"').status, 'Incredible strict reverse inequality');
  t.error(parser.condition.parse('(foo == bar').status, 'Mismatched parens');
  t.error(parser.condition.parse('foo == [1,2,3').status, 'Unclosed array');
  t.error(parser.condition.parse('foo == {baz: "qux"').status, 'Unclosed object');
  t.error(parser.condition.parse('foo == {baz: qux}').status, 'Unquoted object value');
  t.error(parser.condition.parse('foo == 42.').status, 'Incomplete decimal value');
  t.end();
});

/*test('negative predicates', function(t) {
  t.error(parser.predicate.parse('foo == baz').status, 'Unquoted value');
  t.error(parser.predicate.parse('!!foo').status, 'Double notted key');
  t.error(parser.predicate.parse('foo !=== "bar"').status, 'Incredible strict inequality');
  t.error(parser.predicate.parse('foo ===! "bar"').status, 'Incredible strict reverse inequality');
  t.error(parser.predicate.parse('(foo == bar').status, 'Mismatched parens');
  t.error(parser.predicate.parse('foo == [1,2,3').status, 'Unclosed array');
  t.error(parser.predicate.parse('foo == {baz: "qux"').status, 'Unclosed object');
  t.error(parser.predicate.parse('foo == {baz: qux}').status, 'Unquoted object value');
  t.error(parser.predicate.parse('foo == 42.').status, 'Incomplete decimal value');
  t.error(parser.predicate.parse('^foo').status, 'Invalid existence operator');
  t.error(parser.predicate.parse('!(foo == "baz"').status, 'Not condition missing closing paren');
  t.error(parser.predicate.parse('!foo == "baz")').status, 'Not condition missing opening paren');
  t.error(parser.predicate.parse('!foo == "baz"').status, 'Not condition missing parens');
  t.error(parser.predicate.parse('42 == "baz"').status, 'Invalid numeric key');
  t.end();
});*/

test('negative expressions', function(t) {
  t.error(parser.expressions.parse('foo == "baz" &&').status, 'No rhs to expression');
  t.error(parser.expressions.parse('&& bar').status, 'No lhs to expression');
  t.error(parser.expressions.parse('&&').status, 'Only operator');
  t.error(parser.expressions.parse('foo == "baz" ||').status, 'No rhs to expression');
  t.error(parser.expressions.parse('|| bar').status, 'No lhs to expression');
  t.error(parser.expressions.parse('||').status, 'Only operator');
  t.error(parser.expressions.parse('(foo || bar').status, 'Missing close paren on grouped expression');
  t.error(parser.expressions.parse('foo || bar)').status, 'Missing open paren on grouped expression');
  t.error(parser.expressions.parse(')foo || bar(').status, 'Reversed parens on grouped expression');
  t.error(parser.expressions.parse('^(foo || bar)').status, 'Invalid notted expression operator');
  t.error(parser.expressions.parse('').status, 'Empty string');
  t.error(parser.expressions.parse('foo bar').status, 'Missing operator');
  t.error(parser.expressions.parse('42 || foo').status, 'Invalid numeric key');
  t.end();
});

test('negative filters', function(t) {
  t.error(parser.filter.parse('foo == "baz" &&').status, 'No rhs to expression');
  t.error(parser.filter.parse('&& bar').status, 'No lhs to expression');
  t.error(parser.filter.parse('&&').status, 'Only operator');
  t.error(parser.filter.parse('foo == "baz" ||').status, 'No rhs to expression');
  t.error(parser.filter.parse('|| bar').status, 'No lhs to expression');
  t.error(parser.filter.parse('||').status, 'Only operator');
  t.error(parser.filter.parse('(foo || bar').status, 'Missing close paren on grouped expression');
  t.error(parser.filter.parse('foo || bar)').status, 'Missing open paren on grouped expression');
  t.error(parser.filter.parse(')foo || bar(').status, 'Reversed parens on grouped expression');
  t.error(parser.filter.parse('^(foo || bar)').status, 'Invalid notted expression operator');
  t.error(parser.filter.parse('foo bar').status, 'Missing operator');
  t.error(parser.filter.parse('42 || foo').status, 'Invalid numeric key');
  t.error(parser.filter.parse('foo == baz').status, 'Unquoted value');
  t.error(parser.filter.parse('!!foo').status, 'Double notted key');
  t.error(parser.filter.parse('foo !=== "bar"').status, 'Incredible strict inequality');
  t.error(parser.filter.parse('foo ===! "bar"').status, 'Incredible strict reverse inequality');
  t.error(parser.filter.parse('(foo == bar').status, 'Mismatched parens');
  t.error(parser.filter.parse('foo == [1,2,3').status, 'Unclosed array');
  t.error(parser.filter.parse('foo == {baz: "qux"').status, 'Unclosed object');
  t.error(parser.filter.parse('foo == {baz: qux}').status, 'Unquoted object value');
  t.error(parser.filter.parse('^foo').status, 'Invalid existence operator');
  t.error(parser.filter.parse('!(foo == "baz"').status, 'Not condition missing closing paren');
  t.error(parser.filter.parse('!foo == "baz")').status, 'Not condition missing opening paren');
  t.error(parser.filter.parse('!foo == "baz"').status, 'Not condition missing parens');
  t.error(parser.filter.parse('42 == "baz"').status, 'Invalid numeric key');
  t.error(parser.filter.parse('foo == baz').status, 'Unquoted value');
  t.error(parser.filter.parse('foo !=== "bar"').status, 'Incredible strict inequality');
  t.error(parser.filter.parse('foo ===! "bar"').status, 'Incredible strict reverse inequality');
  t.error(parser.filter.parse('(foo == bar').status, 'Mismatched parens');
  t.error(parser.filter.parse('foo == [1,2,3').status, 'Unclosed array');
  t.error(parser.filter.parse('foo == {baz: "qux"').status, 'Unclosed object');
  t.error(parser.filter.parse('foo == {baz: qux}').status, 'Unquoted object value');
  t.error(parser.filter.parse('foo == 42.').status, 'Incomplete decimal value');
  t.error(parser.filter.parse('!(foo) &&').status, 'Missing rhs of conjunction');
  t.error(parser.filter.parse('!foo !bar').status, 'Missing operator');
  t.error(parser.filter.parse('!(foo bar)').status, 'Missing operator within notted expression');
  t.end();
});
