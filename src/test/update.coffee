expect = require('chai').expect
tosql = require '../index'

table = tosql 'table', 'id'

describe 'update', () ->

  it 'should return expected sql', () ->
    expect table.where({ name: 'name' }).update age: 21, sex: 'female'
      .to.equal 'UPDATE `table` SET `age` = 21, `sex` = \'female\' WHERE `name` = \'name\''

  it 'should return expected sql', () ->
    expect table.update { age: 21 }, 1
      .to.equal 'UPDATE `table` SET `age` = 21 WHERE `id` = 1'
