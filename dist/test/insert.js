var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table', 'id');

describe('insert', function() {
  it('should throw an error if the data is empty', function() {
    return expect(table.insert).to["throw"](Error);
  });
  return it('should be a sql', function() {
    return expect(table.insert({
      id: 1,
      name: 'name'
    })).to.equal('INSERT INTO `table` (`id`, `name`) VALUES (1, \'name\')');
  });
});
