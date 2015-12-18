var Tosql, _;

_ = require('lodash');

Tosql = (function() {
  var field, sqlTemplates;

  sqlTemplates = {
    SELECT: 'SELECT <%= FIELD %> FROM `<%= TABLE %>`',
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  };

  field = '*';

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
      TABLE: this.table
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

  return Tosql;

})();

module.exports = function(table, id) {
  return new Tosql(table, id);
};
