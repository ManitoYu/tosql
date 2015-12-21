expect = require('chai').expect
tosql = require '../index'

tosql.relations [
  { table: 'table1_id', table1: 'id' }
]
table = tosql 'table'

describe 'join', () ->

  it 'should return expected sql', () ->
    expect table.join('table1').select()
      .to.equal 'SELECT * FROM `table` LEFT JOIN `table1` ON `table1`.`id` = `table`.`table1_id`'

  it 'should return expected sql', () ->
    expect table.join('table1').where('table1.id': 1).select()
      .to.equal 'SELECT * FROM `table` LEFT JOIN `table1` ON `table1`.`id` = `table`.`table1_id` WHERE `table1`.`id` = 1'

  it 'should return expected sql', () ->
    tosql.config 'table', alias: 't'
    expect table.join('table1').where('t.id': 1).select()
      .to.equal 'SELECT * FROM `table` `t` LEFT JOIN `table1` ON `table1`.`id` = `t`.`table1_id` WHERE `t`.`id` = 1'

  it 'shoud throw an error warns that not specify the relation of two tables', () ->
    expect () -> table.join('temp').select()
      .to.throw Error
