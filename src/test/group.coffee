expect = require('chai').expect
tosql = require '../index'

table = tosql 'table'

describe 'group', () ->

  it 'should return expected sql', () ->
    expect table.field([{ count: 'id' }]).group('id').select()
      .to.equal 'SELECT COUNT(`id`) FROM `table` GROUP BY `id`'

  it 'should return expected sql', () ->
    expect table.field(['sex', { sum: 'age' }, { avg: 'age' }]).group('sex').select()
      .to.equal 'SELECT `sex`, SUM(`age`), AVG(`age`) FROM `table` GROUP BY `sex`'

  it 'should throw an error warns that the param of group is invalid', () ->
    expect () -> table.group(1).select()
      .to.throw Error
