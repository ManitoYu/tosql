var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table');

describe('order', function() {
  it('should be return expected sql', function() {
    return expect(table.order('id').select()).to.equal('SELECT * FROM `table` ORDER BY `id` DESC');
  });
  it('should be return expected sql', function() {
    return expect(table.order(['id', 'name']).select()).to.equal('SELECT * FROM `table` ORDER BY `id`, `name` DESC');
  });
  it('should be return expected sql', function() {
    return expect(table.where({
      status: 1
    }).order('id', false).select()).to.equal('SELECT * FROM `table` WHERE `status` = 1 ORDER BY `id` ASC');
  });
  return it('should throw an error warns that field is invalid', function() {
    return expect(function() {
      return table.order(1).select();
    }).to["throw"](Error);
  });
});
