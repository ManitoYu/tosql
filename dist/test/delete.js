var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table', 'id');

describe('delete', function() {
  it('should return expected sql', function() {
    return expect(table.where({
      id: 1
    })["delete"]()).to.equal('DELETE FROM `table` WHERE `id` = 1');
  });
  return it('should return expected sql', function() {
    return expect(table["delete"](1)).to.equal('DELETE FROM `table` WHERE `id` = 1');
  });
});
