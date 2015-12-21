var Tosql, _;

_ = require('lodash');

Tosql = (function() {
  var addQuotation, complileSingleWhere, field, linkAnd, linkAndFilters, linkOr, linkOrFilters, sqlTemplates, translateFilter, translateSpecifedValue, where;

  sqlTemplates = {
    SELECT: 'SELECT <%= FIELD %> FROM `<%= TABLE %>`<%= WHERE %>',
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  };

  field = '*';

  where = '';

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

  linkAndFilters = function(filter, field) {
    return linkAnd(_.map(filter, function(filterValue, filterKey) {
      var obj;
      obj = new Object;
      obj[filterKey] = filterValue;
      return "`" + field + "` " + (translateFilter(obj));
    }));
  };

  linkOrFilters = function(filters, field) {
    return linkOr(_.map(filters, function(filter) {
      return "(" + (linkAndFilters(filter, field)) + ")";
    }));
  };

  translateSpecifedValue = function(filter, field) {
    return "`" + field + "` = " + (addQuotation(filter));
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
    if (where) {
      where = " WHERE " + where;
    }
    return _.template(sqlTemplates.SELECT)({
      FIELD: field,
      TABLE: this.table,
      WHERE: "" + where
    });
  };


  /*
  add records
  @access public
  
  @param {object} data the data will be created as new record
  @return {string} sql
   */

  Tosql.prototype.insert = function(data) {
    var keys, values;
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
    return _.template(sqlTemplates.INSERT)({
      TABLE: this.table,
      KEYS: keys,
      VALUES: values
    });
  };


  /*
  update records
  @access public
  
  @return {string} sql
   */

  Tosql.prototype.update = function() {};


  /*
  delete records
  @access public
  
  @return {string} sql
   */

  Tosql.prototype["delete"] = function() {};


  /*
  join some tables
  @access public
  
  @param {string} on the relation of keys
  @param {string} type join type
  @return {string} sql
   */

  Tosql.prototype.join = function() {
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
    if (_.isNull(conditions) || _.isUndefined(conditions)) {
      where = '';
    }
    return this;
  };

  return Tosql;

})();

module.exports = function(table, id) {
  return new Tosql(table, id);
};

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
