node-logic-filter-strings
=========================

[![Build Status](https://travis-ci.org/phoebesimon/node-logic-filter-strings.svg)](https://travis-ci.org/phoebesimon/node-logic-filter-strings)

A parser that transforms logical expression strings for filtering JSON objects into their equivalent logic filter structure.

#Example
```js
var logicFilterString = require('logic-filter-strings');

var obj = logicFilterString('foo === "bar"&&bar === "baz qux"');
```

Obj will be:
```js
{
  and: {
    'foo': ['bar'],
    'bar': ['baz qux']
  }
}
```

##Filter Language
This interpreter was desgined with the end goal of being able to provide rules for filtering JSON object streams. It was meant to be used by `node-logic-filter` as an alternate means of providing filter rules. In general, strings on the left side of an equality represent keys in an object, and strings/numbers/arrays/objects on the right side of an equality represent values to compare against. You are also able to use &&, ||, and ! as you might expect.

###Case: foo exists in the comparison object
```
'foo'
```

###Case: foo does not exist in the comparison object
```
'!foo'
```

###Case: foo equals string
```
'foo === "bar"'
```
Note: The quotes around "bar" are required


###Case: foo equals array
```
'foo === [1, 2, 3]'
```


###Case: foo equals object
```
'foo === {bar: "baz"}'
```


###Case: foo equals string and bar equals string
```
'foo == "baz" && bar == "qux"'
```
Note: `==` and `===` are interchangeable


###Case: foo does not equal string 
```
'foo !== "baz"'
```


###Case: field on a nested object equals string
```
'foo.bar.qux === "baz"'
```


###Case: Or-ing 3 or more conditions
```
'(foo == "baz" || bar == "qux") || a === "b"'
```
Note: Parentheses are necessary