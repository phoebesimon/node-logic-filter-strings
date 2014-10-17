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


var demorgansMap = {
  '!=': '==',
  '!==': '===',
  '===': '!==',
  '==': '!='
};


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
var strings = exports.strings = {
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
  number: lexeme(regex(/[0-9]+/).map(parseInt)),
  decimal: lexeme(regex(/[0-9]*\.?[0-9]+/).map(parseFloat))
};


// Tokens built out of base strings
var tokens = exports.tokens = {
  operator: strings.and.or(strings.or),

  quoted: lexeme(regex(/["']((?:\\.|.)*?)['"]/, 1).map(function(val) {
    return val.replace(/['"]+/g, '');
  }))
};

tokens.key = lexeme(tokens.quoted.or(regex(/[a-z_\.]+/i)));

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

tokens.value = tokens.objectParse.or(tokens.array).or(tokens.quoted).or(strings.decimal).or(strings.number);

exports.equals = seq(tokens.key, strings.equals, tokens.value);
exports.notEquals = seq(tokens.key, strings.notEquals, tokens.value);

//High Level
//i.e. 'foo === "bar"'
exports.condition = alt(
  exports.equals,
  exports.notEquals
);


//i.e. '(foo === "bar")'
exports.parenCondition = lazy('parenCondition', function() {
  return strings.lparen.then(exports.condition).skip(strings.rparen);
});


//i.e. '!(foo === "bar")'
exports.notCondition = lazy(function() {
  return seq(strings.not, exports.parenCondition.or(exports.expression));
});


exports.anyCondition = alt(
  exports.condition,
  exports.parenCondition,
  exports.notCondition
);

function demorgans(ne1, op, ne2) {
  switch (op) {
    case '||':
      return ['!', 
        [
          [
            ne1[0],
            demorgansMap[ne1[1]],
            ne1[2]
          ],
          '&&',
          [
            ne2[0],
            demorgansMap[ne2[1]],
            ne2[2]
          ]
        ]
      ];

    case '&&':
      return ['!', 
        [
          [
            ne1[0],
            demorgansMap[ne1[1]],
            ne1[2]
          ],
          '||',
          [
            ne2[0],
            demorgansMap[ne2[1]],
            ne2[2]
          ]
        ]
      ];
  }
}


exports.expression = lazy('an expression', function() {
  return alt(
    strings.lparen.then(
      alt(
        seqMap(
          exports.notEquals,
          tokens.operator,
          exports.notEquals,
          demorgans
        ),
        seqMap(
          strings.lparen.then(exports.notEquals).skip(strings.rparen),
          tokens.operator,
          strings.lparen.then(exports.notEquals).skip(strings.rparen),
          demorgans
        )
      )
    ).skip(strings.rparen),
    strings.lparen.then(exports.atom).skip(strings.rparen),
    exports.atom,
    exports.form
  ).map(function(result) {
    if (result instanceof Array) {
      return result;
    } else {
      return [result];
    }
  });
});


exports.atom = alt(
  exports.anyCondition,
  tokens.key,
  tokens.notKey
);


exports.form = lazy('format', function() {
  return alt(
    seq(
      strings.not,
      strings.lparen.then(
        seq(
          exports.expression,
          tokens.operator,
          exports.expression
        )
      ).skip(strings.rparen)
    ),
    strings.lparen.then(
      seq(
        exports.expression,
        tokens.operator,
        exports.expression
      )
    ).skip(strings.rparen)
  );
});


exports.filter = {
  parse: function(string) {
    string = '(' + string + ')';
    return exports.expression.parse(string);
  }
};
