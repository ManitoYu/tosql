_ = require 'lodash'

class Tosql

  # sql templates which will be used to compile into sql
  sqlTemplates =
    SELECT: 'SELECT <%= FIELD %> FROM `<%= TABLE %>`<%= WHERE %>'
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)'
    UPDATE: 'UPDATE `<%= TABLE %>` SET <%= PAIRS %><%= WHERE %>'
    DELETE: 'DELETE FROM `<%= TABLE %>`<%= WHERE %>'

  # the selected fields
  field = '*'
  where = ''

  # translate filters
  translateFilter = (filter) ->
    key = _.keys(filter)[0]
    value = filter[key]

    switch key
      when 'ne' then "!= #{value}"
      when 'le' then "<= #{value}"
      when 'ge' then ">= #{value}"
      when 'eq' then "= #{value}"
      when 'gt' then "> #{value}"
      when 'lt' then "< #{value}"
      when 'like' then "LIKE '#{value}'"
      when 'between'
        throw new Error 'between filter should be a array' if not _.isArray value
        throw new Error 'the length of between filter should be equal 2' if value.length isnt 2
        "BETWEEN #{addQuotation value[0]} AND #{addQuotation value[1]}"
      when 'in'
        "IN (#{
          _.map value, (item) ->
            return addQuotation item
            throw new Error 'the values of IN is invalid'
          .join ', '
        })"
      else throw new Error 'not allowed filter'

  # use and link array
  linkAnd = (andArray) -> andArray.join ' AND '

  # use or link array
  linkOr = (orArray) -> orArray.join ' OR '

  # add quotation according to the type of value
  addQuotation = (value) ->
    if _.isString value then "'#{value}'" else value

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
    "`#{field}` = #{addQuotation filter}"

  # compile single where
  complileSingleWhere = (conditions) ->
    linkAnd _.map conditions, (filters, field) ->
      switch true
        when _.isArray filters then "(#{linkOrFilters filters, field})"
        when _.isPlainObject filters then "#{linkAndFilters filters, field}"
        else
          translateSpecifedValue filters, field

  constructor: (table, pk = '') ->
    @table = table
    @pk = pk

  ###
  query records
  @access public

  @return {string} sql
  ###
  select: () ->
    templateData = FIELD: field, TABLE: @table, WHERE: "#{where}"
    where = ''
    _.template(sqlTemplates.SELECT) templateData

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
      values.push addQuotation value

    throw new Error 'data length should not be 0' if not keys.length

    keys = keys.join ', '
    values = values.join ', '

    templateData = TABLE: @table, KEYS: keys, VALUES: values
    where = ''
    _.template(sqlTemplates.INSERT) templateData

  ###
  update records
  @access public

  @return {string} sql
  ###
  update: (data, pkValue) ->
    if _.isPlainObject data
      pairs = _.map data, (value, key) ->
        "`#{key}` = #{addQuotation value}"
      .join ', '

    if not where and pkValue
      where = " WHERE `#{@pk}` = #{addQuotation pkValue}"

    templateData = TABLE: @table, PAIRS: pairs, WHERE: where
    where = ''
    _.template(sqlTemplates.UPDATE) templateData

  ###
  delete records
  @access public

  @return {string} sql
  ###
  delete: (pkValue) ->
    where = " WHERE `#{@pk}` = #{pkValue}" if not where and pkValue
    templateData = TABLE: @table, WHERE: where
    where = ''
    _.template(sqlTemplates.DELETE) templateData

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
        "(#{complileSingleWhere condition})"

    # object
    if _.isPlainObject conditions
      where = complileSingleWhere conditions

    # number or string
    if _.isNumber(conditions) or _.isString(conditions)
      throw new Error 'not specify the primary key of table' if not @pk
      where = translateSpecifedValue conditions, @pk

    where = " WHERE #{where}" if where
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
