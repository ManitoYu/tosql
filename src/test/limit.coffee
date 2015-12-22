expect = require('chai').expect
tosql = require '../index'

table = tosql 'table'

describe 'limit', () ->

  it 'should return expected sql', () ->
    expect table.limit(0, 10).select()
      .to.equal 'SELECT * FROM `table` LIMIT 0, 10'

  it 'should return expected sql', () ->
    expect table.limit(1).select()
      .to.equal 'SELECT * FROM `table` LIMIT 1'

  it 'should return expected sql', () ->
    expect table.where(status: 1).limit(1).update name: 'yucong'
      .to.equal 'UPDATE `table` SET `name` = \'yucong\' WHERE `status` = 1 LIMIT 1'

  it 'should return expected sql', () ->
    expect table.where(status: 1).limit(1).delete()
      .to.equal 'DELETE FROM `table` WHERE `status` = 1 LIMIT 1'

  it 'should throw an error warns that the params of limit is invalid', () ->
    expect () -> table.limit('').select()
      .to.throw Error
