'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (joiObj, obj) {
  var result = joiObj.validate(obj, { presence: 'required' });
  if (!result.error) {
    return null;
  }
  return JSON.stringify(result.error.details, undefined, 2);
};