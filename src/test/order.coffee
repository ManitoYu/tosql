expect = require('chai').expect
tosql = require '../index'

table = tosql 'table'

describe 'order', () ->

  it 'should be return expected sql', () ->
    expect table.order('id').select()
      .to.equal 'SELECT * FROM `table` ORDER BY `id` DESC'

  it 'should be return expected sql', () ->
    expect table.order(['id', 'name']).select()
      .to.equal 'SELECT * FROM `table` ORDER BY `id`, `name` DESC'

  it 'should be return expected sql', () ->
    expect table.where({ status: 1 }).order('id', false).select()
      .to.equal 'SELECT * FROM `table` WHERE `status` = 1 ORDER BY `id` ASC'

  it 'should throw an error warns that field is invalid', () ->
    expect () -> table.order(1).select()
      .to.throw Error
