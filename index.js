var parser = require('./lib/parser');

module.exports = function(filterString) {
  return parser.expression.parse(filterString);
};
