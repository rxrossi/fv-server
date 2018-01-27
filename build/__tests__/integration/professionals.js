'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require('isomorphic-fetch');

var _Professionals = require('../../models/Professionals');

var _Professionals2 = _interopRequireDefault(_Professionals);

var _configureServer = require('../../configureServer');

var _configureServer2 = _interopRequireDefault(_configureServer);

var _errors = require('../../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* global fetch */


var PROFESSIONALS_URL = 'http://localhost:5001/professionals';
var server = void 0;

describe('Professionals Route', function () {
  beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _configureServer2.default)().then(function (sv) {
              sv.start();
              return sv;
            });

          case 2:
            server = _context.sent;
            _context.next = 5;
            return _Professionals2.default.deleteMany({}, function (err) {
              if (err) {
                throw new Error('Could not Professional.deleteMany on DB');
              }
              return true;
            });

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  afterEach(function (done) {
    server.stop().then(function () {
      return done();
    });
  });

  describe('GET Route', function () {
    it('receives an empty array when no professionals', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var answer;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return fetch(PROFESSIONALS_URL).then(function (res) {
                return res.json();
              });

            case 2:
              answer = _context2.sent;


              expect(answer).toEqual({
                code: 200,
                body: []
              });

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));

    it('receives a list of professionals', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var professionalsList, answer;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              professionalsList = [{ name: 'Mary' }, { name: 'Carl' }];
              _context3.next = 3;
              return _Professionals2.default.collection.insert(professionalsList, function (err) {
                if (err) {
                  throw new Error(err);
                }
              });

            case 3:
              _context3.next = 5;
              return fetch(PROFESSIONALS_URL).then(function (res) {
                return res.json();
              });

            case 5:
              answer = _context3.sent;


              expect(answer.code).toEqual(200);
              expect(answer.body.length).toEqual(2);
              expect(_typeof(answer.body[0].id)).toEqual('string');
              // Response is ordered by name
              expect(answer.body[0].name).toEqual(professionalsList[1].name);

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });

  describe('POST Route', function () {
    it('Can post a professional', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var beforeList, professionalExample, res, afterList;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _Professionals2.default.find(function (err, professionals) {
                return professionals;
              });

            case 2:
              beforeList = _context4.sent;

              expect(beforeList.length).toBe(0);

              professionalExample = {
                name: 'Carl'
              };
              _context4.next = 7;
              return fetch(PROFESSIONALS_URL, {
                method: 'POST',
                body: JSON.stringify(professionalExample)
              }).then(function (resp) {
                return resp.json();
              });

            case 7:
              res = _context4.sent;
              _context4.next = 10;
              return _Professionals2.default.find(function (err, professionals) {
                return professionals;
              });

            case 10:
              afterList = _context4.sent;

              expect(afterList.length).toBe(1);
              expect(afterList[0].name).toEqual(professionalExample.name);

              expect(res.code).toEqual(200);
              expect(res.body.name).toEqual(professionalExample.name);

            case 15:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));

    it('Can\'t post a professional with the same name of a previous professional', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var beforeList, professionalExample, res2, afterList;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _Professionals2.default.find(function (err, professionals) {
                return professionals;
              });

            case 2:
              beforeList = _context5.sent;

              expect(beforeList.length).toBe(0);

              professionalExample = {
                name: 'Carl'
              };
              _context5.next = 7;
              return fetch(PROFESSIONALS_URL, {
                method: 'POST',
                body: JSON.stringify(professionalExample)
              }).then(function (res) {
                return res.json();
              });

            case 7:
              _context5.next = 9;
              return fetch(PROFESSIONALS_URL, {
                method: 'POST',
                body: JSON.stringify(professionalExample)
              }).then(function (res) {
                return res.json();
              });

            case 9:
              res2 = _context5.sent;
              _context5.next = 12;
              return _Professionals2.default.find(function (err, professionals) {
                return professionals;
              });

            case 12:
              afterList = _context5.sent;


              expect(afterList.length).toBe(1);
              expect(afterList[0].name).toEqual(professionalExample.name);

              // Standard response
              // {
              //  code,
              //  body,
              // }
              expect(res2).toEqual({
                code: 422,
                errors: {
                  name: _errors.NOT_UNIQUE
                }
              });

            case 16:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));
  });

  describe('PUT Route', function () {
    it('updates a professional', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var professional, clientUpdated, updatedProfessionalFromServer;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              // Prepare
              // Insert professional
              professional = new _Professionals2.default({ name: 'Mary' });
              _context6.next = 3;
              return professional.save();

            case 3:

              // Act
              clientUpdated = {
                id: professional._id,
                name: 'Mary2'
              };
              _context6.next = 6;
              return fetch(PROFESSIONALS_URL, {
                method: 'PUT',
                body: JSON.stringify(clientUpdated)
              }).then(function (res) {
                return res.json();
              });

            case 6:
              _context6.next = 8;
              return _Professionals2.default.findById(professional._id);

            case 8:
              updatedProfessionalFromServer = _context6.sent;

              expect(updatedProfessionalFromServer.name).toBe('Mary2');

            case 10:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });

  describe('Delete route', function () {
    it('deletes a professional', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var professional, resp, deletedProfessional;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              // Prepare
              // Insert professional
              professional = new _Professionals2.default({ name: 'Mary' });
              _context7.next = 3;
              return professional.save();

            case 3:
              _context7.next = 5;
              return fetch(PROFESSIONALS_URL, {
                method: 'DELETE',
                body: JSON.stringify(professional._id)
              }).then(function (res) {
                return res.json();
              });

            case 5:
              resp = _context7.sent;
              _context7.next = 8;
              return _Professionals2.default.findById(professional._id);

            case 8:
              deletedProfessional = _context7.sent;

              expect(resp.code).toBe(204);
              expect(deletedProfessional).toEqual(null);

            case 11:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined);
    })));
  });
});