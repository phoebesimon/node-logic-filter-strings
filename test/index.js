var test = require('tape');

var logicFilterString = require('../index.js');


test('simplest exists filter', function(t) {
  var filter = 'foo';

  t.deepEqual(logicFilterString(filter), {'foo': {exists: true}}, 'Simple exists filter parses');
  t.end();
});


test('simplest not exists filter', function(t) {
  var filter = '!foo';

  t.deepEqual(logicFilterString(filter), {not: {'foo': {exists: true}}}, 'Simple not exists filter parses');
  t.end();
});


test('simplest filter', function(t) {
  var filter = 'foo === "bar"';

  t.deepEqual(logicFilterString(filter), {'foo': ['bar']}, 'Simple filter parses');
  t.end();
});


test('simple and filter', function(t) {
  var filter = 'foo === "bar"&&bar === "baz qux"';

  t.deepEqual(logicFilterString(filter), {
    and: {
      'foo': ['bar'],
      'bar': ['baz qux']
    }
  },
  'Simple and filters');
  t.end();
});


test('simple or filter', function(t) {
  var filter = 'foo === "bar" || bar === "baz qux"';

  t.deepEqual(logicFilterString(filter), {
    or: {
      'foo': ['bar'],
      'bar': ['baz qux']
    }
  },
  'Simple or filters');
  t.end();
});


test('simple not filter', function(t) {
  var filter = 'foo !== "bar"';

  t.deepEqual(logicFilterString(filter), {
    not: {
      'foo': ['bar']
    }
  },
  'Simple not filters');
  t.end();
});


test('and->nots filter (De Morgans)', function(t) {
  var filter = 'foo !== "bar" && bar !== "baz"';

  t.deepEqual(logicFilterString(filter), {
    not: {
      or: {
        'foo': ['bar'],
        'bar': ['baz']
      }
    }
  },
  'De Morgan and filters');
  t.end();
});


test('not->or filter (De Morgans)', function(t) {
  var filter = '!(foo === "bar" || bar === "baz")';

  t.deepEqual(logicFilterString(filter), {
    not: {
      or: {
        'foo': ['bar'],
        'bar': ['baz']
      }
    }
  },
  'De Morgan and equivalent filters');
  t.end();
});


test('or->nots filter (De Morgans)', function(t) {
  var filter = 'foo !== "bar" || bar !== "baz"';

  t.deepEqual(logicFilterString(filter), {
    not: {
      and: {
        'foo': ['bar'],
        'bar': ['baz']
      }
    }
  },
  'De Morgan or and filters');
  t.end();
});


test('not->and filter (De Morgans)', function(t) {
  var filter = '!(foo === "bar" && bar === "baz")';

  t.deepEqual(logicFilterString(filter), {
    not: {
      and: {
        'foo': ['bar'],
        'bar': ['baz']
      }
    }
  },
  'De Morgan or equivalent filters');
  t.end();
});


test('or->and filter', function(t) {
  var filter = '(foo === "bar" && bar === "baz") || qux === "foo"';

  t.deepEqual(logicFilterString(filter), {
    or: {
      and: {
        'foo': ['bar'],
        'bar': ['baz']
      },
      'qux': ['foo']
    }
  },
  'Nested or->and filters');
  t.end();
});


test('and->exists filter', function(t) {
  var filter = 'foo && bar =="baz"';

  t.deepEqual(logicFilterString(filter), {
    and: {
      foo: {
        exists: true
      },
      'bar': ['baz']
    }
  },
  'and->exists filters');
  t.end();
});


test('and->not exists filter', function(t) {
  var filter = '!foo && bar =="baz"';

  t.deepEqual(logicFilterString(filter), {
    and: {
      not: {
        foo: {
          exists: true
        }
      },
      'bar': ['baz']
    }
  },
  'and->not exists filters');
  t.end();
});


test('any filter', function(t) {
  var filter = '(foo === "baz" || foo === "bar") || foo === "qux"';

  t.deepEqual(logicFilterString(filter), {
    or: {
      foo: ['qux'],
      or: {
        foo: ['baz', 'bar']
      }
    }
  },
  'Any filters');
  t.end();
});


test('nonsensical any filter', function(t) {
  var filter = '(foo === "baz" && foo === "bar") && foo === "qux"';

  t.deepEqual(logicFilterString(filter), {
    and: {
      foo: ['qux'],
      and: {
        foo: ['baz', 'bar']
      }
    }
  },
  'nonsensical any filters');
  t.end();
});


test('not any filter', function(t) {
  var filter = '!(foo === "baz" || foo === "bar") || foo === "qux"';

  t.deepEqual(logicFilterString(filter), {
    or: {
      foo: ['qux'],
      not: {
        or: {
          foo: ['baz', 'bar']
        }
      }
    }
  },
  'Not->any filters');
  t.end();
});


test('literal object filter', function(t) {
  var filter = 'foo === {bar: "baz"}';

  t.deepEqual(logicFilterString(filter), {
    foo: [{bar: 'baz'}]
  },
  'Literal object filters');
  t.end();
});


test('dot notation exists', function(t) {
  var filter = 'foo.bar';

  t.deepEqual(logicFilterString(filter), {
    foo: {
      bar: {
        exists: true
      }
    }
  },
  'dot notation exists');
  t.end();
});


test('dot notation not exists', function(t) {
  var filter = '!foo.bar';

  t.deepEqual(logicFilterString(filter), {
    not: {
      foo: {
        bar: {
          exists: true
        }
      }
    }
  },
  'dot notation not exists');
  t.end();
});


test('inner object filter', function(t) {
  var filter = 'foo.bar === "baz"';

  t.deepEqual(logicFilterString(filter), {
    foo: {
      bar: ['baz']
    }
  },
  'Inner object filters');
  t.end();
});


test('inner object any filter', function(t) {
  var filter = 'foo.bar === "baz" || foo.bar == "qux"';

  t.deepEqual(logicFilterString(filter), {
    or: {
      foo: {
        bar: ['baz', 'qux']
      }
    }
  },
  'Inner object any filters');
  t.end();
});


test('triple nested object filter', function(t) {
  var filter = 'foo.bar.qux === "baz"';

  t.deepEqual(logicFilterString(filter), {
    foo: {
      bar: {
        qux: ['baz']
      }
    }
  },
  'Triple nested object filters');
  t.end();
});


test('any with array filter', function(t) {
  var filter = 'foo === "bar" || foo === [1, 2, 3]';

  t.deepEqual(logicFilterString(filter), {
    or: {
      foo: ['bar', [1, 2, 3]]
    }
  },
  'Any with array filters');
  t.end();
});

test('unparsable string', function(t) {
  t.throws(logicFilterString.bind(null, 'this-is-unparsable'));
  t.end();
});
