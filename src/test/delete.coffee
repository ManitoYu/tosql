expect = require('chai').expect
tosql = require '../index'

table = tosql 'table', 'id'

describe 'delete', () ->

  it 'should return expected sql', () ->
    expect table.where({ id: 1 }).delete()
      .to.equal 'DELETE FROM `table` WHERE `id` = 1'

  it 'should return expected sql', () ->
    expect table.delete 1
      .to.equal 'DELETE FROM `table` WHERE `id` = 1'
