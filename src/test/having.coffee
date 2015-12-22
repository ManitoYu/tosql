expect = require('chai').expect
tosql = require '../index'

table = tosql 'table'

describe 'having', () ->

  it 'should return expected sql', () ->
    expect table.field([{ avg: 'age' }]).group('sex').having({ avg: 'age' }, { eq: 20 }).select()
      .to.equal 'SELECT AVG(`age`) FROM `table` GROUP BY `sex` HAVING AVG(`age`) = 20'

  it 'should throw an error warns that tha params of having is invalid', () ->
    expect () -> table.field([{ avg: 'age' }]).group('sex').having().select()
      .to.throw Error
