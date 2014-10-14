var Parsimmon = require('parsimmon');
var regex = Parsimmon.regex;
var string = Parsimmon.string;
var optWhitespace = Parsimmon.optWhitespace;
var lazy = Parsimmon.lazy;
var seq = Parsimmon.seq;
var succeed = Parsimmon.succeed;
var alt = Parsimmon.alt;


function lexeme(parser) {
  return parser.skip(optWhitespace);
}


function seqMap() {
  var args = [].slice.call(arguments);
  var mapper = args.pop();
  return seq.apply(null, args).map(function(results) {
    return mapper.apply(null, results);
  });
};


function commaSep(parser) {
  var commaParser = comma.then(parser).many()
  return seqMap(parser, commaParser, function(first, rest) {
    return [first].concat(rest);
  }).or(succeed([]));
}

var lbrace = lexeme(string('{'));
var rbrace = lexeme(string('}'));
var lbrack = lexeme(string('['));
var rbrack = lexeme(string(']'));
var colon = lexeme(string(':'));
var and = lexeme(string('&&'));
var or = lexeme(string('||'));
var operator = and.or(or);
var not = lexeme(string('!'));
var notEquals = lexeme(string('!==').or(string('!=')));
var equals = lexeme(string('===').or(string('==')));
var notKey = seq(not, key);
var quoted = lexeme(regex(/["']((?:\\.|.)*?)['"]/, 1).map(function(val) {
  return val.replace(/['"]+/g, '');
}));
var key = lexeme(quoted.or(regex(/[a-z_\.]*/i)));
var number = lexeme(regex(/[0-9]*/).map(parseInt));
var comma = lexeme(string(','));
var pair = lazy('pair', function() {
  return seq(key.skip(colon), value);
});
var array = lazy('array', function() {
  return seqMap(lbrack, commaSep(value), rbrack, function(_, results, __) {
    return results;
  });
});

var objectParse = lazy('object', function() {
  return seqMap(lbrace, commaSep(pair), rbrace, function(_, results, __) {
    var ret = {}, i;
    for (i = 0; i < results.length; i++) {
      ret[results[i][0]] = results[i][1];
    }
    return ret;
  });
});

var value = objectParse.or(array).or(quoted).or(number);


var condition = seq(key, equals.or(notEquals), value)
var predicate = alt(condition, key, notKey);
var expression = seq(predicate, operator, predicate);

var filter = lazy('a filter', function() {
  return seq(key, equals, value);
});

exports.parseCondition = function(conditionString) {
  console.log(condition.parse(conditionString));
  return condition.parse(conditionString);
};

exports.parsePredicate = function(predicateString) {
  return predicate.parse(predicateString);
};

exports.parseExpression = function(expressionString) {
  return expression.parse(expressionString);
};

exports.parse = function(filterString) {
  return predicate.parse(filterString);
};
