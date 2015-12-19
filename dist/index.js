var Tosql, _;

_ = require('lodash');

Tosql = (function() {
  var field, linkAnd, linkAndFilters, linkOr, linkOrFilters, sqlTemplates, translateFilter, translateSpecifedValue, where;

  sqlTemplates = {
    SELECT: 'SELECT <%= FIELD %> FROM `<%= TABLE %>` <%= WHERE %>',
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
      case 'eq':
        return "= " + value;
      case 'gt':
        return "> " + value;
      case 'lt':
        return "< " + value;
      case 'like':
        return "LIKE '" + value + "'";
      case 'in':
        return "IN (" + (_.map(value, function(item) {
          if (_.isString(item)) {
            return "'" + item + "'";
          }
          if (_.isNumber(item)) {
            return item;
          }
          throw new Error('the values of IN is invalid');
        }).join(', ')) + ")";
    }
  };

  linkAnd = function(andArray) {
    return andArray.join(' AND ');
  };

  linkOr = function(orArray) {
    return orArray.join(' OR ');
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
    if (_.isString(filter)) {
      filter = "'" + filter + "'";
    }
    return "`" + field + "` = " + filter;
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
    return _.template(sqlTemplates.SELECT)({
      FIELD: field,
      TABLE: this.table,
      WHERE: "WHERE " + where
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
      return values.push((function() {
        switch (false) {
          case !_.isNumber(value):
            return value;
          case !_.isString(value):
            return "\'" + value + "\'";
        }
      })());
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
        return "(" + (linkAnd(_.map(condition, function(filters, field) {
          switch (true) {
            case _.isArray(filters):
              return "(" + (linkOrFilters(filters, field)) + ")";
            case _.isPlainObject(filters):
              return "(" + (linkAndFilters(filters, field)) + ")";
            default:
              return translateSpecifedValue(filters, field);
          }
        }))) + ")";
      }));
    }
    if (_.isPlainObject(conditions)) {
      where = linkAnd(_.map(conditions, function(filters, field) {
        switch (true) {
          case _.isArray(filters):
            return "(" + (linkOrFilters(filters, field)) + ")";
          case _.isPlainObject(filters):
            return "(" + (linkAndFilters(filters, field)) + ")";
          default:
            return translateSpecifedValue(filters, field);
        }
      }));
    }
    if (_.isNumber(conditions || _.isString(conditions))) {
      if (!this.pk) {
        throw new Error('not specify the primary key of table');
      }
      where = translateSpecifedValue(conditions, this.pk);
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
