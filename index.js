var parser = require('./lib/parser');

var OPERATORS = {
  '&&': 'and',
  '||': 'or'
};


function condition(filterObj, key, value) {
  var keys = key.split('.'),
      i = 0;

  function makeObj(obj, _key, _keys) {

    if (_keys.length === 0) {
      if (!value) {
        obj[_key] = {
          exists: true
        };
      } else {
        if (obj.hasOwnProperty(_key) && obj[_key]){
          obj[_key].push(value);
        } else {
          obj[_key] = [value];
        }
      }
      return obj;
    }

    if (!obj[_key]) {
      obj[_key] = {}
    }

    obj =  makeObj(obj[_key], _keys.shift(), _keys);
    return obj;
  }

  return makeObj(filterObj, keys.shift(), keys);
}

function notCondition(filterObj, key, value) {
  if (!filterObj.hasOwnProperty('not')) {
    filterObj.not = {};
  }
  filterObj.not[key] = [value];
}


function convert(filterAST) {
  var i = 0,
      value;

  if (!filterAST.status) {
    throw new Error('Could not parse string');
  }

  value = filterAST.value;


  function _convert(obj, val) {
    if (val.length === 1 && typeof val[0] === 'string') {
      //Exists condition
      condition(obj, val[0]);
    } else if (val.length === 3 && (val[1] === '==' || val[1] === '===')) {
      //Equality condition
      condition(obj, val[0], val[2]);
    } else if (val.length === 3 && (val[1] === '!=' || val[1] === '!==')) {
      //Inequality condition
      notCondition(obj, val[0], val[2]);
    } else if (val.length === 2 && val[0] === '!') {
      //Not expression
      if (!obj.not) {
        obj.not = {};
      }
      _convert(obj.not, val[1]);
    } else if (val.length === 3 && OPERATORS[val[1]]) {
      //and/or expression
      var label = OPERATORS[val[1]];

      if (!obj[label]){
        obj[label] = {};
      }
      _convert(obj[label], val[0]);
      _convert(obj[label], val[2]);
    }

    return obj;
  };

  return _convert({}, value);
}


module.exports = function(filterString) {
  return convert(parser.filter.parse(filterString));
};
