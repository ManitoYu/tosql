_ = require 'lodash'

class Tosql

  # sql templates which will be used to compile into sql
  sqlTemplates =
    SELECT: 'SELECT <%= FIELD %> FROM `<%= TABLE %>` <%= WHERE %>'
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)'
    UPDATE: 'UPDATE'
    DELETE: 'DELETE'

  # the selected fields
  field = '*'
  where = ''

  # translate filters
  translateFilter = (filter) ->
    key = _.keys(filter)[0]
    value = filter[key]

    switch key
      when 'eq' then "= #{value}"
      when 'gt' then "> #{value}"
      when 'lt' then "< #{value}"
      when 'like' then "LIKE '#{value}'"
      when 'in'
        "IN (#{
          _.map value, (item) ->
            return "'#{item}'" if _.isString item
            return item if _.isNumber item
            throw new Error 'the values of IN is invalid'
          .join ', '
        })"

  # use and link array
  linkAnd = (andArray) -> andArray.join ' AND '

  # use or link array
  linkOr = (orArray) -> orArray.join ' OR '

  # link and filters
  linkAndFilters = (filter, field) ->
    linkAnd _.map filter, (filterValue, filterKey) ->
      obj = new Object
      obj[filterKey] = filterValue
      "`#{field}` #{translateFilter obj}"

  # link or filters
  linkOrFilters = (filters, field) ->
    linkOr _.map filters, (filter) -> "(#{linkAndFilters filter, field})"

  # translate specified value
  translateSpecifedValue = (filter, field) ->
    filter = "'#{filter}'" if _.isString filter
    "`#{field}` = #{filter}"

  constructor: (table, pk = '') ->
    @table = table
    @pk = pk

  ###
  query records
  @access public

  @return {string} sql
  ###
  select: () ->
    _.template(sqlTemplates.SELECT) FIELD: field, TABLE: @table, WHERE: "WHERE #{where}"

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

  ###
  filter the records according to conditions
  @access public

  @param {array|object} conditions the conditions
  @return {string} sql
  ###
  where: (conditions) ->
    # array
    if _.isArray conditions
      where = linkOr _.map conditions, (condition) ->
        "(#{
          linkAnd _.map condition, (filters, field) ->
            switch true
              when _.isArray filters then "(#{linkOrFilters filters, field})"
              when _.isPlainObject filters then "(#{linkAndFilters filters, field})"
              else
                translateSpecifedValue filters, field
        })"

    # object
    if _.isPlainObject conditions
      where = linkAnd _.map conditions, (filters, field) ->
        switch true
          when _.isArray filters then "(#{linkOrFilters filters, field})"
          when _.isPlainObject filters then "(#{linkAndFilters filters, field})"
          else
            translateSpecifedValue filters, field

    # number or string
    if _.isNumber conditions or _.isString conditions
      throw new Error 'not specify the primary key of table' if not @pk
      where = translateSpecifedValue conditions, @pk

    this

module.exports = (table, id) -> new Tosql table, id

# table = tosql 'table'
# table.pk 'id'

# table.insert data
# table.delete 1
# table.update data
# table.select
[
  { id: [{ like: '%12131%' }, { gt: 1, lt: 10 }] }
  { name: { like: '%fasfasf%' } }
]

# table
#   .field(['name', 'id'])
#   .where('and', { name: 'name', id: 1 })
#   .where('or', { name: '%yucong%', id: '%1%' })
#   .where('like', { name: 'name', id: 2 })
#   .select()
