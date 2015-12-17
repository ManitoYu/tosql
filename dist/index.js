var Tosql, _;

_ = require('lodash');

Tosql = (function() {
  var sqlTemplates;

  sqlTemplates = {
    SELECT: 'SELECT',
    INSERT: 'INSERT INTO `<%= TABLE %>` (<%= KEYS %>) VALUES (<%= VALUES %>)',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
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

  Tosql.prototype.select = function() {};


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

  return Tosql;

})();

module.exports = Tosql;
