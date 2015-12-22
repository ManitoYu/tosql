var conn, mysql, sql, table, tosql;

mysql = require('mysql');

tosql = require('./index');

conn = mysql.createConnection({
  host: '192.168.1.100',
  user: 'yucong',
  password: 'yucong',
  database: 'paopao_admin'
});

conn.connect();

table = tosql('table');

sql = table.field([
  'sex', {
    sum: 'sex'
  }
]).group('sex').having({
  sum: 'sex'
}, {
  gt: 1
}).select();

console.log(sql);

sql = table.select();

console.log(sql);

conn.end();
