var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table');

describe('having', function() {
  it('should return expected sql', function() {
    return expect(table.field([
      {
        avg: 'age'
      }
    ]).group('sex').having({
      avg: 'age'
    }, {
      eq: 20
    }).select()).to.equal('SELECT AVG(`age`) FROM `table` GROUP BY `sex` HAVING AVG(`age`) = 20');
  });
  return it('should throw an error warns that tha params of having is invalid', function() {
    return expect(function() {
      return table.field([
        {
          avg: 'age'
        }
      ]).group('sex').having().select();
    }).to["throw"](Error);
  });
});
