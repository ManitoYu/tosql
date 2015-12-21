var Tosql, _;

_ = require('lodash');

Tosql = (function() {
  var addQuotation, complileSingleWhere, field, fieldWithTable, join, linkAnd, linkAndFilters, linkOr, linkOrFilters, sqlTemplates, translateFilter, translateSpecifedValue, where;

  sqlTemplates = {
    SELECT: 'SELECT <%= FIELD %> FROM <%= TABLE %><%= JOIN %><%= WHERE %>',
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)',
    UPDATE: 'UPDATE `<%= TABLE %>` SET <%= PAIRS %><%= WHERE %>',
    DELETE: 'DELETE FROM `<%= TABLE %>`<%= WHERE %>',
    JOIN: ' <%= JOIN_TYPE %>JOIN <%= LEFT_TABLE %> ON `<%= LEFT_TABLE_ALIAS %>`.`<%= LEFT_TABLE_KEY %>` = `<%= RIGHT_TABLE_ALIAS %>`.`<%= RIGHT_TABLE_KEY %>`'
  };

  field = '*';

  where = '';

  join = '';

  Tosql.tables = {};

  Tosql.relations = [];

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

  function Tosql(table, pk) {
    if (pk == null) {
      pk = '';
    }
    this.table = table;
    this.pk = pk;
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
      JOIN: join
    };
    where = '';
    join = '';
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
    where = '';
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
      where = " WHERE `" + this.pk + "` = " + (addQuotation(pkValue));
    }
    templateData = {
      TABLE: this.table,
      PAIRS: pairs,
      WHERE: where
    };
    where = '';
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
      where = " WHERE `" + this.pk + "` = " + pkValue;
    }
    templateData = {
      TABLE: this.table,
      WHERE: where
    };
    where = '';
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
      return "`" + value + "`";
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
      if (!this.pk) {
        throw new Error('not specify the primary key of table');
      }
      where = translateSpecifedValue(conditions, this.pk);
    }
    if (where) {
      where = " WHERE " + where;
    }
    return this;
  };

  return Tosql;

})();

module.exports = (function() {
  var fn;
  fn = function(table, id) {
    if (!Tosql.tables[table]) {
      Tosql.tables[table] = {};
    }
    Tosql.tables[table].table || (Tosql.tables[table].table = new Tosql(table, id));
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

[
  {
    id: [
      {
        like: '%12131%'
      }, {
        gt: 1,
        lt: 10
      }
    ]
  }, {
    name: {
      like: '%fasfasf%'
    }
  }
];
