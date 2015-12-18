expect = require('chai').expect
tosql = require '../index'

table = tosql 'table'

describe 'field', () ->

  it 'the param should be a array', () ->
    fn = () -> table.field('fields').select()
    expect(fn).to.throw Error

  it 'should be only some fields', () ->
    expect(table.field(['id', 'name']).select()).to.equal 'SELECT `id`, `name` FROM `table`'
