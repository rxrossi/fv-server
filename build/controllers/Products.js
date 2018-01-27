'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Products = require('../models/Products');

var _Products2 = _interopRequireDefault(_Products);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import { addSourceOrDestination } from '../controllers/Stock';

var addSourceOrDestination = function addSourceOrDestination(entry) {
  var sourceOrDestination = {};

  if (entry.sale) {
    sourceOrDestination.name = entry.sale.name + ' (' + entry.sale.client.name + ')';
    sourceOrDestination.sale_id = entry.sale._id;
  }
  if (entry.purchase) {
    sourceOrDestination.seller = '' + entry.purchase.seller;
    sourceOrDestination.purchase_id = entry.purchase._id;
  }

  return _extends({}, entry, {
    sourceOrDestination: sourceOrDestination
  });
};

var ProductsController = function () {
  function ProductsController(tenantId) {
    _classCallCheck(this, ProductsController);

    this.Model = _Products2.default.byTenant(tenantId);
  }

  _createClass(ProductsController, [{
    key: 'getAll',
    value: function getAll() {
      return this.Model.find({ $or: [{ deleted: false }, { deleted: undefined }] }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 }).populate({
        path: 'stock',
        populate: {
          path: 'sale',
          populate: {
            path: 'client'
          }
        }
      }).populate({
        path: 'stock',
        populate: {
          path: 'purchase'
        }
      }).then(function (products) {
        return products.map(function (product) {
          return product.toObject();
        });
      }).then(function (products) {
        return products.map(function (product) {
          return _extends({}, product, {
            stock: product.stock.map(function (entry) {
              return addSourceOrDestination(entry);
            })
          });
        });
      }).then(function (products) {
        return products.map(function (product) {
          return (0, _Products.addPrice)(product);
        });
      }).then(function (products) {
        return products.map(function (product) {
          return (0, _Products.addQuantity)(product);
        });
      }).then(function (products) {
        return products.map(function (product) {
          return (0, _Products.addAvgPriceFiveLast)(product);
        });
      });
    }
  }, {
    key: 'getOne',
    value: function getOne(id) {
      return this.Model.findById(id).populate({
        path: 'stock',
        populate: {
          path: 'sale'
        }
      }).populate({
        path: 'stock',
        populate: {
          path: 'purchase'
        }
      }).then(function (product) {
        return product.toObject();
      })
      // .then(product => addSourceOrDestination(product))
      .then(function (product) {
        return (0, _Products.addPrice)(product);
      }).then(function (product) {
        return (0, _Products.addQuantity)(product);
      }).then(function (product) {
        return (0, _Products.addAvgPriceFiveLast)(product);
      });
    }
  }, {
    key: 'create',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(body) {
        var name, measure_unit, errors, validMeasureUnits, product, t1;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                name = body.name, measure_unit = body.measure_unit;
                errors = {};
                validMeasureUnits = ['ml', 'unit', 'mg'];


                if (!validMeasureUnits.includes(measure_unit)) {
                  errors.measure_unit = _errors.INVALID;
                }

                if (!measure_unit) {
                  errors.measure_unit = _errors.BLANK;
                }

                // Check if name is duplicated
                _context.next = 7;
                return this.Model.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }, function (err, product) {
                  if (err) {
                    return console.error('error when finding a product with this name');
                  }
                  if (product) {
                    errors.name = _errors.NOT_UNIQUE;
                  }
                });

              case 7:

                if (!name) {
                  errors.name = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context.next = 14;
                  break;
                }

                product = new this.Model({ name: name, measure_unit: measure_unit });
                _context.next = 12;
                return product.save(function (err) {
                  return true;
                });

              case 12:
                t1 = _context.sent;
                return _context.abrupt('return', {
                  product: product
                });

              case 14:
                return _context.abrupt('return', {
                  errors: errors
                });

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'update',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(product) {
        var name, measure_unit, _id, errors, validMeasureUnits, productUpdated;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                name = product.name, measure_unit = product.measure_unit, _id = product._id;
                errors = {};
                validMeasureUnits = ['ml', 'unit', 'mg'];


                if (!validMeasureUnits.includes(measure_unit)) {
                  errors.measure_unit = _errors.INVALID;
                }

                if (!measure_unit) {
                  errors.measure_unit = _errors.BLANK;
                }

                // Check if name is duplicated
                _context2.next = 7;
                return this.Model.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }, function (err, prod) {
                  if (err) {
                    return console.error('error when finding a product with this name');
                  }
                  if (prod && prod._id.toString() !== _id) {
                    errors.name = _errors.NOT_UNIQUE;
                  }
                });

              case 7:

                if (!name) {
                  errors.name = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context2.next = 13;
                  break;
                }

                _context2.next = 11;
                return this.Model.findByIdAndUpdate(_id, { $set: { name: name, measure_unit: measure_unit } }, { new: true });

              case 11:
                productUpdated = _context2.sent;
                return _context2.abrupt('return', {
                  product: productUpdated.toObject()
                });

              case 13:
                return _context2.abrupt('return', {
                  errors: errors
                });

              case 14:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function update(_x2) {
        return _ref2.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'delete',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id) {
        var product;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.Model.findById(id);

              case 2:
                product = _context3.sent;

                product.name = product.name + ' deativated at ' + Date.now();
                _context3.next = 6;
                return product.save();

              case 6:
                _context3.next = 8;
                return product.delete();

              case 8:
                return _context3.abrupt('return', product);

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _delete(_x3) {
        return _ref3.apply(this, arguments);
      }

      return _delete;
    }()
  }]);

  return ProductsController;
}();

exports.default = ProductsController;