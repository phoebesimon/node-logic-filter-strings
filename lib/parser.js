var Parsimmon = require('parsimmon');
var regex = Parsimmon.regex;
var string = Parsimmon.string;
var lazy = Parsimmon.lazy;
var seq = Parsimmon.seq;
var succeed = Parsimmon.succeed;
var alt = Parsimmon.alt;


function lexeme(parser) {
  return parser.skip(Parsimmon.optWhitespace);
}


// Parsimmon has this in git, but they haven't cut a release that includes it yet.
// https://github.com/jneen/parsimmon/blob/master/src/parsimmon.js#L106
function seqMap() {
  var args = [].slice.call(arguments);
  var mapper = args.pop();
  return seq.apply(null, args).map(function(results) {
    return mapper.apply(null, results);
  });
}


function commaSep(parser) {
  var commaParser = strings.comma.then(parser).many();

  return seqMap(parser, commaParser, function(first, rest) {
    return [first].concat(rest);
  }).or(succeed([]));
}


// Base strings
var strings = {
  lbrace: lexeme(string('{')),
  rbrace: lexeme(string('}')),
  lbrack: lexeme(string('[')),
  rbrack: lexeme(string(']')),
  lparen: lexeme(string('(')),
  rparen: lexeme(string(')')),
  colon: lexeme(string(':')),
  comma: lexeme(string(',')),
  and: lexeme(string('&&')),
  or: lexeme(string('||')),
  not: lexeme(string('!')),
  notEquals: lexeme(string('!==').or(string('!='))),
  equals: lexeme(string('===').or(string('=='))),
  number: lexeme(regex(/[0-9]*/).map(parseInt))
};


// Tokens built out of bast strings
var tokens = {
  operator: strings.and.or(strings.or),

  quoted: lexeme(regex(/["']((?:\\.|.)*?)['"]/, 1).map(function(val) {
    return val.replace(/['"]+/g, '');
  }))
};

tokens.key = lexeme(tokens.quoted.or(regex(/[a-z_]*/i)));

tokens.notKey = seqMap(strings.not, tokens.key, function(not, key) {
  return not + key;
});

tokens.pair = lazy('pair', function() {
  return seq(tokens.key.skip(strings.colon), tokens.value);
});

tokens.objectParse = lazy('object', function() {
  return seqMap(strings.lbrace, commaSep(tokens.pair), strings.rbrace, function(_, results, __) {
    var ret = {}, i;

    for (i = 0; i < results.length; i++) {
      ret[results[i][0]] = results[i][1];
    }
    return ret;
  });
});

tokens.array = lazy('array', function() {
 return seqMap(strings.lbrack, commaSep(tokens.value), strings.rbrack, function(_, results, __) {
   return results;
 });
});

tokens.value = tokens.objectParse.or(tokens.array).or(tokens.quoted).or(strings.number);


// High level expressions
exports.condition = seqMap(
  tokens.key,
  strings.equals.or(strings.notEquals),
  tokens.value,
  function(key, equals, value) {
    debugger;
    console.log('CONDITION', key, equals, value);
    return [key, equals, value];
  }
);

exports.notCondition = seq(strings.not, strings.lparen.then(exports.condition).skip(strings.rparen));

exports.predicate = alt(
  exports.notCondition,
  tokens.notKey,
  exports.condition,
  tokens.key
);

exports.expression = alt(
  exports.notCondition,
  seqMap(
    exports.predicate,
    tokens.operator,
    exports.predicate,
    function(pred1, op, pred2) {
      var ret = [];

      debugger;
      console.log('EXPRESSION', pred1, op, pred2);

      if (!pred1 && !pred2) {
        return op;
      }

      if (pred1) {
        if (pred1 instanceof Array) {
          ret.push(pred1);
        } else {
          ret.push([pred1]);
        }
      }

      ret.push(op);

      if (pred2) {
        if (pred2 instanceof Array) {
          ret.push(pred2);
        } else {
          ret.push([pred2]);
        }
      }

      console.log('FINISHED EXPRESSION', ret);
      return ret;
    }
  )
);

exports.groupedExpression = seqMap(strings.lparen, exports.expression, strings.rparen, function(lp, expr, rp) {
  debugger;
  console.log('GROUPED EXPRESSION', lp, expr, rp);
  return expr;
});

exports.nottedExpression = alt(
  seqMap(strings.not, exports.groupedExpression, function(not, group) {
    debugger;
    console.log('NOTTED EXPRESSION', not, group);
    return [not, group];
  })
);


exports.expressions = alt(
  exports.expression,
  exports.nottedExpression,
  exports.groupedExpression
);

exports.filter = exports.expressions.many();
