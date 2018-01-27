'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addSourceOrDestination = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Stock = require('../models/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Products = require('../controllers/Products');

var _Products2 = _interopRequireDefault(_Products);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var addSourceOrDestination = exports.addSourceOrDestination = function addSourceOrDestination(entry) {
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

var StockController = function () {
  function StockController(tenantId) {
    var Model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Stock2.default;

    _classCallCheck(this, StockController);

    this.Model = Model.byTenant(tenantId);
    this.Products = new _Products2.default(tenantId);
  }

  _createClass(StockController, [{
    key: 'getAll',
    value: function getAll() {
      return this.Model.find({}).populate({
        path: 'sale',
        populate: {
          path: 'client'
        }
      }).populate('product').populate('purchase').then(function (entries) {
        return entries.map(function (entry) {
          return entry.toObject();
        });
      }).then(function (entries) {
        return entries.map(function (entry) {
          return addSourceOrDestination(entry);
        });
      });
    }
  }, {
    key: 'create',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(postBody) {
        var price_per_unit;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!postBody.sale) {
                  _context.next = 6;
                  break;
                }

                _context.next = 3;
                return this.Products.getOne(postBody.product).then(function (x) {
                  return x.price_per_unit;
                });

              case 3:
                _context.t0 = _context.sent;
                _context.next = 7;
                break;

              case 6:
                _context.t0 = postBody.total_price / postBody.qty;

              case 7:
                price_per_unit = _context.t0;
                return _context.abrupt('return', new this.Model({
                  product: postBody.product,
                  purchase: postBody.purchase,
                  sale: postBody.sale,
                  qty: postBody.qty,
                  price_per_unit: price_per_unit,
                  date: postBody.date
                }).save());

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x2) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }]);

  return StockController;
}();

exports.default = StockController;