_ = require 'lodash'

class Tosql

  # sql templates which will be used to compile into sql
  sqlTemplates =
    SELECT: 'SELECT <%= FIELD %> FROM `<%= TABLE %>`'
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)'
    UPDATE: 'UPDATE'
    DELETE: 'DELETE'

  # the selected fields
  field = '*'

  constructor: (table, pk = '') ->
    @table = table
    @pk = pk

  ###
  query records
  @access public

  @return {string} sql
  ###
  select: () ->
    _.template(sqlTemplates.SELECT) FIELD: field, TABLE: @table

  ###
  add records
  @access public

  @param {object} data the data will be created as new record
  @return {string} sql
  ###
  insert: (data) ->
    keys = []
    values = []

    _.forEach data, (value, key) ->
      keys.push "`#{key}`"

      values.push switch
        when _.isNumber value then value
        when _.isString value then "\'#{value}\'"

    throw new Error 'data length should not be 0' if not keys.length

    keys = keys.join ', '
    values = values.join ', '

    _.template(sqlTemplates.INSERT) TABLE: @table, KEYS: keys, VALUES: values

  ###
  update records
  @access public

  @return {string} sql
  ###
  update: () ->

  ###
  delete records
  @access public

  @return {string} sql
  ###
  delete: () ->


  ###
  join some tables
  @access public

  @param {string} on the relation of keys
  @param {string} type join type
  @return {string} sql
  ###
  join: () ->
    this

  ###
  select some fields
  @access public

  @param {array} fields the list of fields
  @return {string} sql
  ###
  field: (fields) ->
    throw new Error 'fields must be a array' if not _.isArray fields
    field = _.map(fields, (value) -> "`#{value}`").join ', '
    this

module.exports = (table, id) -> new Tosql table, id

# table = tosql 'table'
# table.pk 'id'

# table.insert data
# table.delete 1
# table.update data
# table.select

# table
#   .field(['name', 'id'])
#   .where('and', { name: 'name', id: 1 })
#   .where('or', { name: '%yucong%', id: '%1%' })
#   .where('like', { name: 'name', id: 2 })
#   .select()
