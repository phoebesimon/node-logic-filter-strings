var parser = require('./lib/parser');

module.exports = function(filterString) {
  return parser.filter.parse(filterString);
};
