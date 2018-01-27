'use strict';

require('isomorphic-fetch');

var _Clients = require('../../models/Clients');

var _Clients2 = _interopRequireDefault(_Clients);

var _configureServer = require('../../configureServer');

var _configureServer2 = _interopRequireDefault(_configureServer);

var _errors = require('../../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* global fetch */


var CLIENTS_URL = 'http://localhost:5001/clients';
var server = void 0;

var errHandler = function errHandler(err) {
  return err ? console.error(err) : false;
};

describe('Clients Route', function () {
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
            return _Clients2.default.deleteMany({}, errHandler);

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
    it('receives an empty array when no clients', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var answer;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return fetch(CLIENTS_URL).then(function (res) {
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

    it('receives a list of clients', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var clientsList, answer;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              clientsList = [{ name: 'John', phone: '999 888 7777' }, { name: 'Mary', phone: '999 777 6666' }];
              _context3.next = 3;
              return _Clients2.default.collection.insert(clientsList, errHandler);

            case 3:
              _context3.next = 5;
              return fetch(CLIENTS_URL).then(function (res) {
                return res.json();
              });

            case 5:
              answer = _context3.sent;


              expect(answer.code).toEqual(200);
              expect(answer.body.length).toEqual(2);
              expect(answer.body[0].name).toEqual(clientsList[0].name);

            case 9:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });

  describe('POST Route', function () {
    it('Can post a client', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var beforeList, john, res, afterList;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _Clients2.default.find(function (err, clients) {
                return clients;
              });

            case 2:
              beforeList = _context4.sent;

              expect(beforeList.length).toBe(0);

              john = {
                name: 'John',
                phone: '999'
              };
              _context4.next = 7;
              return fetch(CLIENTS_URL, {
                method: 'POST',
                body: JSON.stringify(john)
              }).then(function (resp) {
                return resp.json();
              });

            case 7:
              res = _context4.sent;
              _context4.next = 10;
              return _Clients2.default.find(function (err, clients) {
                return clients;
              });

            case 10:
              afterList = _context4.sent;

              expect(afterList.length).toBe(1);
              expect(afterList[0].name).toEqual(john.name);

              expect(res.code).toEqual(200);
              expect(res.body.name).toEqual(john.name);

            case 15:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));

    it('Can\'t post a client with the same name of a previous client', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var beforeList, john, res2, afterList;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _Clients2.default.find(function (err, clients) {
                return clients;
              });

            case 2:
              beforeList = _context5.sent;

              expect(beforeList.length).toBe(0);

              john = {
                name: 'John',
                phone: '999'
              };
              _context5.next = 7;
              return fetch(CLIENTS_URL, {
                method: 'POST',
                body: JSON.stringify(john)
              }).then(function (res) {
                return res.json();
              });

            case 7:
              _context5.next = 9;
              return fetch(CLIENTS_URL, {
                method: 'POST',
                body: JSON.stringify(john)
              }).then(function (res) {
                return res.json();
              });

            case 9:
              res2 = _context5.sent;
              _context5.next = 12;
              return _Clients2.default.find(function (err, clients) {
                return clients;
              });

            case 12:
              afterList = _context5.sent;


              expect(afterList.length).toBe(1);
              expect(afterList[0].name).toEqual(john.name);

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
    it('updates a client', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var client, clientUpdated, updatedClientFromServer;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              // Prepare
              // Insert client
              client = new _Clients2.default({ name: 'Mary', phone: '999 777 6666' });
              _context6.next = 3;
              return client.save();

            case 3:

              // Act
              clientUpdated = {
                id: client._id,
                name: 'Mary2',
                phone: client.phone
              };
              _context6.next = 6;
              return fetch(CLIENTS_URL, {
                method: 'PUT',
                body: JSON.stringify(clientUpdated)
              }).then(function (res) {
                return res.json();
              });

            case 6:
              _context6.next = 8;
              return _Clients2.default.findById(client._id);

            case 8:
              updatedClientFromServer = _context6.sent;

              expect(updatedClientFromServer.name).toBe('Mary2');

            case 10:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });

  describe('Delete route', function () {
    it('deletes a client', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var client, resp, deletedClient;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              // Prepare
              // Insert client
              client = new _Clients2.default({ name: 'Mary', phone: '999 777 6666' });
              _context7.next = 3;
              return client.save();

            case 3:
              _context7.next = 5;
              return fetch(CLIENTS_URL, {
                method: 'DELETE',
                body: JSON.stringify(client._id)
              }).then(function (res) {
                return res.json();
              });

            case 5:
              resp = _context7.sent;
              _context7.next = 8;
              return _Clients2.default.findById(client._id);

            case 8:
              deletedClient = _context7.sent;

              expect(resp.code).toBe(204);
              expect(deletedClient).toEqual(null);

            case 11:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined);
    })));
  });
});