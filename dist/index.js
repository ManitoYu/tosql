var Tosql, _;

_ = require('lodash');

Tosql = (function() {
  var addQuotation, complileSingleWhere, field, fieldWithTable, group, having, join, limit, linkAnd, linkAndFilters, linkOr, linkOrFilters, order, reset, sqlTemplates, translateFilter, translateSpecifedValue, where;

  sqlTemplates = {
    SELECT: 'SELECT <%= FIELD %> FROM <%= TABLE %><%= JOIN %><%= WHERE %><%= GROUP %><%= HAVING %><%= ORDER %><%= LIMIT %>',
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)',
    UPDATE: 'UPDATE `<%= TABLE %>` SET <%= PAIRS %><%= WHERE %><%= LIMIT %>',
    DELETE: 'DELETE FROM `<%= TABLE %>`<%= WHERE %><%= LIMIT %>',
    JOIN: ' <%= JOIN_TYPE %>JOIN <%= LEFT_TABLE %> ON `<%= LEFT_TABLE_ALIAS %>`.`<%= LEFT_TABLE_KEY %>` = `<%= RIGHT_TABLE_ALIAS %>`.`<%= RIGHT_TABLE_KEY %>`'
  };

  field = '*';

  where = '';

  join = '';

  group = '';

  having = '';

  order = '';

  limit = '';

  Tosql.tables = {};

  Tosql.relations = [];

  reset = function() {
    field = '*';
    where = '';
    join = '';
    group = '';
    having = '';
    order = '';
    return limit = '';
  };

  translateFilter = function(filter) {
    var key, value;
    key = _.keys(filter)[0];
    value = filter[key];
    switch (key) {
      case 'ne':
        return "!= " + value;
      case 'le':
        return "<= " + value;
      case 'ge':
        return ">= " + value;
      case 'eq':
        return "= " + value;
      case 'gt':
        return "> " + value;
      case 'lt':
        return "< " + value;
      case 'like':
        return "LIKE '" + value + "'";
      case 'between':
        if (!_.isArray(value)) {
          throw new Error('between filter should be a array');
        }
        if (value.length !== 2) {
          throw new Error('the length of between filter should be equal 2');
        }
        return "BETWEEN " + (addQuotation(value[0])) + " AND " + (addQuotation(value[1]));
      case 'in':
        return "IN (" + (_.map(value, function(item) {
          return addQuotation(item);
          throw new Error('the values of IN is invalid');
        }).join(', ')) + ")";
      default:
        throw new Error('not allowed filter');
    }
  };

  linkAnd = function(andArray) {
    return andArray.join(' AND ');
  };

  linkOr = function(orArray) {
    return orArray.join(' OR ');
  };

  addQuotation = function(value) {
    if (_.isString(value)) {
      return "'" + value + "'";
    } else {
      return value;
    }
  };

  fieldWithTable = function(field) {
    var temp;
    temp = field.split('.');
    switch (false) {
      case 1 !== _.size(temp):
        return "`" + temp[0] + "`";
      case 2 !== _.size(temp):
        return "`" + temp[0] + "`.`" + temp[1] + "`";
      default:
        throw new Error('invalid field');
    }
  };

  linkAndFilters = function(filter, field) {
    return linkAnd(_.map(filter, function(filterValue, filterKey) {
      var obj;
      obj = new Object;
      obj[filterKey] = filterValue;
      return (fieldWithTable(field)) + " " + (translateFilter(obj));
    }));
  };

  linkOrFilters = function(filters, field) {
    return linkOr(_.map(filters, function(filter) {
      return "(" + (linkAndFilters(filter, field)) + ")";
    }));
  };

  translateSpecifedValue = function(filter, field) {
    return (fieldWithTable(field)) + " = " + (addQuotation(filter));
  };

  complileSingleWhere = function(conditions) {
    return linkAnd(_.map(conditions, function(filters, field) {
      switch (true) {
        case _.isArray(filters):
          return "(" + (linkOrFilters(filters, field)) + ")";
        case _.isPlainObject(filters):
          return "" + (linkAndFilters(filters, field));
        default:
          return translateSpecifedValue(filters, field);
      }
    }));
  };

  function Tosql(table) {
    this.table = table;
  }


  /*
  query records
  @access public
  
  @return {string} sql
   */

  Tosql.prototype.select = function() {
    var alias, templateData;
    alias = _.defaults(Tosql.tables[this.table], {
      alias: ''
    }).alias;
    templateData = {
      FIELD: field,
      TABLE: "`" + this.table + "`" + (alias && ' `' + alias + '`'),
      WHERE: "" + where,
      JOIN: join,
      GROUP: group,
      HAVING: having,
      ORDER: order,
      LIMIT: limit
    };
    reset();
    return _.template(sqlTemplates.SELECT)(templateData);
  };


  /*
  add records
  @access public
  
  @param {object} data the data will be created as new record
  @return {string} sql
   */

  Tosql.prototype.insert = function(data) {
    var keys, templateData, values;
    keys = [];
    values = [];
    _.forEach(data, function(value, key) {
      keys.push("`" + key + "`");
      return values.push(addQuotation(value));
    });
    if (!keys.length) {
      throw new Error('data length should not be 0');
    }
    keys = keys.join(', ');
    values = values.join(', ');
    templateData = {
      TABLE: this.table,
      KEYS: keys,
      VALUES: values
    };
    reset();
    return _.template(sqlTemplates.INSERT)(templateData);
  };


  /*
  update records
  @access public
  
  @return {string} sql
   */

  Tosql.prototype.update = function(data, pkValue) {
    var pairs, templateData;
    if (_.isPlainObject(data)) {
      pairs = _.map(data, function(value, key) {
        return "`" + key + "` = " + (addQuotation(value));
      }).join(', ');
    }
    if (!where && pkValue) {
      where = " WHERE `" + Tosql.tables[this.table].pk + "` = " + (addQuotation(pkValue));
    }
    templateData = {
      TABLE: this.table,
      PAIRS: pairs,
      WHERE: where,
      LIMIT: limit
    };
    reset();
    return _.template(sqlTemplates.UPDATE)(templateData);
  };


  /*
  delete records
  @access public
  
  @return {string} sql
   */

  Tosql.prototype["delete"] = function(pkValue) {
    var templateData;
    if (!where && pkValue) {
      where = " WHERE `" + Tosql.tables[this.table].pk + "` = " + pkValue;
    }
    templateData = {
      TABLE: this.table,
      WHERE: where,
      LIMIT: limit
    };
    reset();
    return _.template(sqlTemplates.DELETE)(templateData);
  };


  /*
  join some tables
  @access public
  
  @param {string} on the relation of keys
  @param {string} type join type
  @return {string} sql
   */

  Tosql.prototype.join = function(leftTable, rightTable, type) {
    var joinRelation, leftAlias, rightAlias;
    if (type == null) {
      type = 'LEFT';
    }
    if (!rightTable) {
      rightTable = this.table;
    }
    joinRelation = _.first(_.filter(Tosql.relations, function(relation) {
      return 2 === _.size(_.intersection([leftTable, rightTable], _.keys(relation)));
    }));
    if (!joinRelation) {
      throw new Error('not specify the relation of two tables');
    }
    leftAlias = _.defaults(Tosql.tables[leftTable] || {}, {
      alias: ''
    }).alias;
    rightAlias = _.defaults(Tosql.tables[rightTable] || {}, {
      alias: ''
    }).alias;
    join += _.template(sqlTemplates.JOIN)({
      JOIN_TYPE: type + ' ',
      LEFT_TABLE: "`" + leftTable + "`" + (leftAlias && ' `' + leftAlias + '`'),
      LEFT_TABLE_ALIAS: leftAlias || leftTable,
      RIGHT_TABLE_ALIAS: rightAlias || rightTable,
      LEFT_TABLE_KEY: joinRelation[leftTable],
      RIGHT_TABLE_KEY: joinRelation[rightTable]
    });
    return this;
  };


  /*
  select some fields
  @access public
  
  @param {array} fields the list of fields
  @return {string} sql
   */

  Tosql.prototype.field = function(fields) {
    if (!_.isArray(fields)) {
      throw new Error('fields must be a array');
    }
    field = _.map(fields, function(value) {
      switch (false) {
        case !_.isPlainObject(value):
          return (_.keys(value)[0].toUpperCase()) + "(" + (fieldWithTable(_.values(value)[0])) + ")";
        case !_.isString(value):
          return "`" + value + "`";
        default:
          throw new Erorr('invalid field');
      }
    }).join(', ');
    return this;
  };


  /*
  filter the records according to conditions
  @access public
  
  @param {array|object} conditions the conditions
  @return {string} sql
   */

  Tosql.prototype.where = function(conditions) {
    if (_.isArray(conditions)) {
      where = linkOr(_.map(conditions, function(condition) {
        return "(" + (complileSingleWhere(condition)) + ")";
      }));
    }
    if (_.isPlainObject(conditions)) {
      where = complileSingleWhere(conditions);
    }
    if (_.isNumber(conditions) || _.isString(conditions)) {
      if (!Tosql.tables[this.table].pk) {
        throw new Error('not specify the primary key of table');
      }
      where = translateSpecifedValue(conditions, Tosql.tables[this.table].pk);
    }
    if (where) {
      where = " WHERE " + where;
    }
    return this;
  };


  /*
  sort records according to fields
  @access public
  
  @param {string} field the field used to sort
  @param {boolean} desc whether or not order by desc, default desc
  @return {string} sql
   */

  Tosql.prototype.order = function(field, desc) {
    if (desc == null) {
      desc = true;
    }
    field = (function() {
      switch (false) {
        case !_.isArray(field):
          return _.map(field, function(item) {
            return fieldWithTable(item);
          }).join(', ');
        case !_.isString(field):
          return fieldWithTable(field);
        default:
          throw new Error('field is invalid');
      }
    })();
    order = " ORDER BY " + field + " " + (desc ? 'DESC' : 'ASC');
    return this;
  };


  /*
  limit fixed records
  @access public
  
  @param {integer} start
  @param {integer} rows the number of rows will be returned
  @return {string} sql
   */

  Tosql.prototype.limit = function(start, rows) {
    if (!_.isNumber(start)) {
      throw new Error('the params of limit is invalid');
    }
    if (arguments.length === 2) {
      if (!_.isNumber(rows)) {
        throw new Error('the params of limit is invalid');
      }
      limit = " LIMIT " + start + ", " + rows;
    }
    if (arguments.length === 1) {
      limit = " LIMIT " + start;
    }
    return this;
  };


  /*
  group records according fields
  @access public
  
  @return {string} sql
   */

  Tosql.prototype.group = function(field) {
    if (!_.isString(field)) {
      throw new Error('the param of group is invalid');
    }
    group = " GROUP BY " + (fieldWithTable(field));
    return this;
  };


  /*
  @access public
  
  @param {object} func { sum: 'id' }
  @param {object} compare { eq: 1 }
  @return {string} sql
   */

  Tosql.prototype.having = function(func, compare) {
    if (!_.isPlainObject(func) || !_.isPlainObject(compare)) {
      throw new Error('the params of having is invalid');
    }
    having = " HAVING " + (_.keys(func)[0].toUpperCase()) + "(" + (fieldWithTable(_.values(func)[0])) + ") " + (translateFilter(compare));
    return this;
  };

  return Tosql;

})();

module.exports = (function() {
  var fn;
  fn = function(table, pk) {
    if (!Tosql.tables[table]) {
      Tosql.tables[table] = {};
    }
    Tosql.tables[table].table || (Tosql.tables[table].table = new Tosql(table));
    Tosql.tables[table].pk = pk;
    return Tosql.tables[table].table;
  };
  fn.relations = function(relations) {
    return Tosql.relations = relations;
  };
  fn.config = function(table, config) {
    if (!Tosql.tables[table]) {
      Tosql.tables[table] = {};
    }
    return _.assign(Tosql.tables[table], config);
  };
  fn.remove = function(table) {
    return delete Tosql.tables[table];
  };
  return fn;
})();
