var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table');

describe('field', function() {
  it('the param should be a array', function() {
    var fn;
    fn = function() {
      return table.field('fields').select();
    };
    return expect(fn).to["throw"](Error);
  });
  return it('should be only some fields', function() {
    return expect(table.field(['id', 'name']).select()).to.equal('SELECT `id`, `name` FROM `table`');
  });
});
