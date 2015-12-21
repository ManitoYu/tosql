var expect, table, tosql;

expect = require('chai').expect;

tosql = require('../index');

table = tosql('table', 'id');

describe('where', function() {
  it("should return expected sql", function() {
    var where;
    where = {
      id: 1,
      name: 'yucong'
    };
    return expect(table.where(where).select()).to.equal('SELECT * FROM `table` WHERE `id` = 1 AND `name` = \'yucong\'');
  });
  it('should return expected sql', function() {
    var where;
    where = [
      {
        id: 1
      }, {
        name: 'yucong'
      }
    ];
    return expect(table.where(where).select()).to.equal('SELECT * FROM `table` WHERE (`id` = 1) OR (`name` = \'yucong\')');
  });
  it('should return expected sql', function() {
    var where;
    where = {
      id: [
        {
          eq: 1
        }, {
          gt: 2
        }
      ]
    };
    return expect(table.where(where).select()).to.equal('SELECT * FROM `table` WHERE ((`id` = 1) OR (`id` > 2))');
  });
  it('should return expected sql', function() {
    var where;
    where = {
      id: [
        {
          eq: 1,
          lt: 1
        }, {
          gt: 2
        }
      ],
      name: {
        "in": ['a', 'b', 'c']
      }
    };
    return expect(table.where(where).select()).to.equal('SELECT * FROM `table` WHERE ((`id` = 1 AND `id` < 1) OR (`id` > 2)) AND `name` IN (\'a\', \'b\', \'c\')');
  });
  it('should return expected sql', function() {
    var where;
    where = [
      {
        id: {
          gt: 0,
          lt: 10
        }
      }, {
        name: 'yucong'
      }
    ];
    return expect(table.where(where).select()).to.equal('SELECT * FROM `table` WHERE (`id` > 0 AND `id` < 10) OR (`name` = \'yucong\')');
  });
  it('should return expected sql', function() {
    var where;
    where = null;
    return expect(table.where(where).select()).to.equal('SELECT * FROM `table`');
  });
  it('should return expected sql', function() {
    return expect(table.where(1).select()).to.equal('SELECT * FROM `table` WHERE `id` = 1');
  });
  it('should throw an error warns that not specify the primary key', function() {
    table = tosql('table');
    return expect(function() {
      return table.where(1).select;
    }).to["throw"](Error);
  });
  return it('should throw an error warns that not allowed filter', function() {
    return expect(function() {
      return table.where({
        id: {
          abc: 1
        }
      }).select();
    }).to["throw"](Error);
  });
});
