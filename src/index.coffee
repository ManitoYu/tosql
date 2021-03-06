_ = require 'lodash'

class Tosql

  # sql templates which will be used to compile into sql
  sqlTemplates =
    SELECT: 'SELECT <%= FIELD %> FROM <%= TABLE %><%= JOIN %><%= WHERE %><%= GROUP %><%= HAVING %><%= ORDER %><%= LIMIT %>'
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)'
    UPDATE: 'UPDATE `<%= TABLE %>` SET <%= PAIRS %><%= WHERE %><%= LIMIT %>'
    DELETE: 'DELETE FROM `<%= TABLE %>`<%= WHERE %><%= LIMIT %>'
    JOIN: ' <%= JOIN_TYPE %>JOIN <%= LEFT_TABLE %> ON `<%= LEFT_TABLE_ALIAS %>`.`<%= LEFT_TABLE_KEY %>` = `<%= RIGHT_TABLE_ALIAS %>`.`<%= RIGHT_TABLE_KEY %>`'

  # the selected fields
  field = '*'
  where = ''
  join = ''
  group = ''
  having = ''
  order = ''
  limit = ''

  # the cache used to store objects have been created
  Tosql.tables = {}
  # the cache used to store relations of some tables
  Tosql.relations = []

  reset = () ->
    field = '*'
    where = ''
    join = ''
    group = ''
    having = ''
    order = ''
    limit = ''

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

  #
  fieldWithTable = (field) ->
    temp = field.split '.'
    switch
      when 1 is _.size temp then "`#{temp[0]}`"
      when 2 is _.size temp then "`#{temp[0]}`.`#{temp[1]}`"
      else
        throw new Error 'invalid field'

  # link and filters
  linkAndFilters = (filter, field) ->
    linkAnd _.map filter, (filterValue, filterKey) ->
      obj = new Object
      obj[filterKey] = filterValue
      "#{fieldWithTable field} #{translateFilter obj}"

  # link or filters
  linkOrFilters = (filters, field) ->
    linkOr _.map filters, (filter) -> "(#{linkAndFilters filter, field})"

  # translate specified value
  translateSpecifedValue = (filter, field) ->
    "#{fieldWithTable field} = #{addQuotation filter}"

  # compile single where
  complileSingleWhere = (conditions) ->
    linkAnd _.map conditions, (filters, field) ->
      switch true
        when _.isArray filters then "(#{linkOrFilters filters, field})"
        when _.isPlainObject filters then "#{linkAndFilters filters, field}"
        else
          translateSpecifedValue filters, field

  constructor: (table) ->
    @table = table


  ###
  query records
  @access public

  @return {string} sql
  ###
  select: () ->
    # alias of main table
    alias = _.defaults(Tosql.tables[@table], alias: '').alias
    templateData =
      FIELD: field
      TABLE: "`#{@table}`#{alias and ' `' + alias + '`'}"
      WHERE: "#{where}"
      JOIN: join
      GROUP: group
      HAVING: having
      ORDER: order
      LIMIT: limit

    reset()
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
    reset()
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
      where = " WHERE `#{Tosql.tables[@table].pk}` = #{addQuotation pkValue}"

    templateData = TABLE: @table, PAIRS: pairs, WHERE: where, LIMIT: limit
    reset()
    _.template(sqlTemplates.UPDATE) templateData

  ###
  delete records
  @access public

  @return {string} sql
  ###
  delete: (pkValue) ->
    where = " WHERE `#{Tosql.tables[@table].pk}` = #{pkValue}" if not where and pkValue
    templateData = TABLE: @table, WHERE: where, LIMIT: limit
    reset()
    _.template(sqlTemplates.DELETE) templateData

  ###
  join some tables
  @access public

  @param {string} on the relation of keys
  @param {string} type join type
  @return {string} sql
  ###
  join: (leftTable, rightTable, type = 'LEFT') ->
    rightTable = @table if not rightTable
    joinRelation = _.first _.filter Tosql.relations, (relation) ->
      2 is _.size _.intersection [leftTable, rightTable], _.keys relation

    throw new Error 'not specify the relation of two tables' if not joinRelation

    leftAlias = _.defaults(Tosql.tables[leftTable] || {}, alias: '' ).alias
    rightAlias = _.defaults(Tosql.tables[rightTable] || {}, alias: '' ).alias

    join += _.template(sqlTemplates.JOIN)
      JOIN_TYPE: type + ' '
      LEFT_TABLE: "`#{leftTable}`#{leftAlias and ' `' + leftAlias + '`'}"
      LEFT_TABLE_ALIAS: leftAlias || leftTable
      RIGHT_TABLE_ALIAS: rightAlias || rightTable
      LEFT_TABLE_KEY: joinRelation[leftTable]
      RIGHT_TABLE_KEY: joinRelation[rightTable]

    this

  ###
  select some fields
  @access public

  @param {array} fields the list of fields
  @return {string} sql
  ###
  field: (fields) ->
    throw new Error 'fields must be a array' if not _.isArray fields
    field = _.map fields, (value) ->
      switch
        when _.isPlainObject value then "#{_.keys(value)[0].toUpperCase()}(#{fieldWithTable _.values(value)[0]})"
        when _.isString value then "`#{value}`"
        else
          throw new Erorr 'invalid field'
    .join ', '
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
      throw new Error 'not specify the primary key of table' if not Tosql.tables[@table].pk
      where = translateSpecifedValue conditions, Tosql.tables[@table].pk

    where = " WHERE #{where}" if where
    this

  ###
  sort records according to fields
  @access public

  @param {string} field the field used to sort
  @param {boolean} desc whether or not order by desc, default desc
  @return {string} sql
  ###
  order: (field, desc = true) ->
    field = switch
      when _.isArray field then _.map(field, (item) -> fieldWithTable item).join ', '
      when _.isString field then fieldWithTable field
      else
        throw new Error 'field is invalid'

    order = " ORDER BY #{field} #{if desc then 'DESC' else 'ASC'}"
    this

  ###
  limit fixed records
  @access public

  @param {integer} start
  @param {integer} rows the number of rows will be returned
  @return {string} sql
  ###
  limit: (start, rows) ->
    throw new Error 'the params of limit is invalid' if not _.isNumber(start)
    if arguments.length is 2
      throw new Error 'the params of limit is invalid' if not _.isNumber(rows)
      limit = " LIMIT #{start}, #{rows}"
    if arguments.length is 1
      limit = " LIMIT #{start}"
    this

  ###
  group records according fields
  @access public

  @return {string} sql
  ###
  group: (field) ->
    throw new Error 'the param of group is invalid' if not _.isString field
    group = " GROUP BY #{fieldWithTable field}"
    this

  ###
  @access public

  @param {object} func { sum: 'id' }
  @param {object} compare { eq: 1 }
  @return {string} sql
  ###
  having: (func, compare) ->
    throw new Error 'the params of having is invalid' if not _.isPlainObject(func) or not _.isPlainObject(compare)
    having = " HAVING #{_.keys(func)[0].toUpperCase()}(#{fieldWithTable  _.values(func)[0]}) #{translateFilter compare}"
    this

module.exports = do () ->
  fn = (table, pk) ->
    Tosql.tables[table] = {} if not Tosql.tables[table]
    # cache table
    Tosql.tables[table].table or Tosql.tables[table].table = new Tosql table
    Tosql.tables[table].pk = pk
    Tosql.tables[table].table

  fn.relations = (relations) -> Tosql.relations = relations

  fn.config = (table, config) ->
    Tosql.tables[table] = {} if not Tosql.tables[table]
    # merge config
    _.assign Tosql.tables[table], config

  # remove the table cache
  fn.remove = (table) ->
    delete Tosql.tables[table]

  fn
