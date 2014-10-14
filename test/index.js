var test = require('tape');

var logicFilterString = require('../index.js');


test('simplest filter', function(t) {
  var filter = 'foo === "bar"';

  t.deepEqual(logicFilterString.parse(filter), {'foo': 'bar'}, 'Simple filter parses');
  t.end();
});


test('simple and filter', function(t) {
  var filter = 'foo === "bar"&&bar === "baz qux"';

  t.deepEqual(logicFilterString.parse(filter), {
    and: {
      'foo': 'bar',
      'bar': 'baz'
    }
  },
  'Simple and filter parses');
  t.end();
});


test('simple or filter', function(t) {
  var filter = 'foo === "bar" || bar === "baz qux"';

  t.deepEqual(logicFilterString.parse(filter), {
    or: {
      'foo': 'bar',
      'bar': 'baz'
    }
  },
  'Simple or filter parses');
  t.end();
});


test('simple not filter', function(t) {
  var filter = 'foo !== "bar"';

  t.deepEqual(logicFilterString.parse(filter), {
    not: {
      'foo': 'bar'
    }
  },
  'Simple not filter parses');
  t.end();
});


test('and->nots filter (De Morgans)', function(t) {
  var filter = 'foo !== "bar" && bar !== "baz"';

  t.deepEqual(logicFilterString.parse(filter), {
    not: {
      or: {
        'foo': 'bar',
        'bar': 'baz'
      }
    }
  },
  'De Morgan and filter parses');
  t.end();
});


test('not->or filter (De Morgans)', function(t) {
  var filter = '!(foo === "bar" || bar === "baz")';

  t.deepEqual(logicFilterString.parse(filter), {
    not: {
      or: {
        'foo': 'bar',
        'bar': 'baz'
      }
    }
  },
  'De Morgan and equivalent filter parses');
  t.end();
});


test('or->nots filter (De Morgans)', function(t) {
  var filter = 'foo !== "bar" || bar !== "baz"';

  t.deepEqual(logicFilterString.parse(filter), {
    not: {
      and: {
        'foo': 'bar',
        'bar': 'baz'
      }
    }
  },
  'De Morgan or and filter parses');
  t.end();
});


test('not->and filter (De Morgans)', function(t) {
  var filter = '!(foo === "bar" && bar === "baz")';

  t.deepEqual(logicFilterString.parse(filter), {
    not: {
      and: {
        'foo': 'bar',
        'bar': 'baz'
      }
    }
  },
  'De Morgan or equivalent filter parses');
  t.end();
});


test('or->and filter', function(t) {
  var filter = '(foo === "bar" && bar === "baz") || qux === "foo"';

  t.deepEqual(logicFilterString.parse(filter), {
    or: {
      and: {
        'foo': 'bar',
        'bar': 'baz'
      },
      'qux': 'foo'
    }
  },
  'Nested or->and filter parses');
  t.end();
});


test('and->exists filter', function(t) {
  var filter = 'foo && bar =="baz"';

  t.deepEqual(logicFilterString.parse(filter), {
    and: {
      foo: {
        exists: true
      },
      'bar': 'baz'
    }
  },
  'and->exists filter parses');
  t.end();
});


test('and->not exists filter', function(t) {
  var filter = '!foo && bar =="baz"';

  t.deepEqual(logicFilterString.parse(filter), {
    and: {
      foo: {
        exists: false
      },
      'bar': 'baz'
    }
  },
  'and->not exists filter parses');
  t.end();
});


test('any filter', function(t) {
  var filter = '(foo === "baz" || foo === "bar" || foo === "qux")';

  t.deepEqual(logicFilterString.parse(filter), {
    foo: ['baz', 'bar', 'qux']
  },
  'Any filter parses');
  t.end();
});


test('bad any filter', function(t) {
  var filter = '(foo === "baz" && foo === "bar" && foo === "qux")';

  t.ifError(logicFilterString.parse(filter), 'Cannot use "and" for one field');
  t.end();
});


test('not any filter', function(t) {
  var filter = '!(foo === "baz" || foo === "bar" || foo === "qux")';

  t.deepEqual(logicFilterString.parse(filter), {
    not: {
      foo: ['baz', 'bar', 'qux']
    }
  },
  'Not->any filter parses');
  t.end();
});


test('literal object filter', function(t) {
  var filter = 'foo === {bar: "baz"}';

  t.deepEqual(logicFilterString.parse(filter), {
    foo: {
      value: {
        bar: 'baz'
      }
    }
  },
  'Literal object filter parses');
  t.end();
});


test('inner object filter', function(t) {
  var filter = 'foo.bar === "baz"';

  t.deepEqual(logicFilterString.parse(filter), {
    foo: {
      bar: 'baz'
    }
  },
  'Inner object filter parses');
  t.end();
});


test('inner object any filter', function(t) {
  var filter = 'foo.bar === "baz" || foo.bar == "qux"';

  t.deepEqual(logicFilterString.parse(filter), {
    foo: {
      bar: ['baz', 'qux']
    }
  },
  'Inner object any filter parses');
  t.end();
});


test('triple nested object filter', function(t) {
  var filter = 'foo.bar.qux === "baz"';

  t.deepEqual(logicFilterString.parse(filter), {
    foo: {
      bar: {
        qux: 'baz'
      }
    }
  },
  'Triple nested object filter parses');
  t.end();
});


test('any with array filter', function(t) {
  var filter = 'foo === "bar" || foo === [1, 2, 3]';

  t.deepEqual(logicFilterString.parse(filter), {
    foo: ['bar', [1, 2, 3]]
  },
  'Any with array filter parses');
  t.end();
});
