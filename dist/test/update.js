var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table', 'id');

describe('update', function() {
  it('should return expected sql', function() {
    return expect(table.where({
      name: 'name'
    }).update({
      age: 21,
      sex: 'female'
    })).to.equal('UPDATE `table` SET `age` = 21, `sex` = \'female\' WHERE `name` = \'name\'');
  });
  return it('should return expected sql', function() {
    return expect(table.update({
      age: 21
    }, 1)).to.equal('UPDATE `table` SET `age` = 21 WHERE `id` = 1');
  });
});
