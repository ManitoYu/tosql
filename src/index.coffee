_ = require 'lodash'

class Tosql

  # sql templates which will be used to compile into sql
  sqlTemplates =
    SELECT: 'SELECT'
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)'
    UPDATE: 'UPDATE'
    DELETE: 'DELETE'

  constructor: (table, pk = '') ->
    @table = table
    @pk = pk

  ###
  query records
  @access public

  @return {string} sql
  ###
  select: () ->

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




module.exports = Tosql

# table = tosql 'table'
# table.pk 'id'
#
# table.insert data
# table.delete 1
# table.update data
# table.select
