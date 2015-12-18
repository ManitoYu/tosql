expect = require('chai').expect
tosql = require '../index'

table = tosql 'table', 'id'

describe 'insert', () ->

  it 'should throw an error if the data is empty', () ->
    expect(table.insert).to.throw Error

  it 'should be a sql', () ->
    expect(table.insert id: 1, name: 'name').to.equal 'INSERT INTO `table` (`id`, `name`) VALUES (1, \'name\')'
