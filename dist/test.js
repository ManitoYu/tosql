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

tosql.relations([
  {
    table: 'table1_id',
    table1: 'id'
  }
]);

tosql.config('table', {
  alias: 't'
});

tosql.config('table1', {
  alias: 't1'
});

table = tosql('table');

sql = table.join('table1').where({
  't.id': 1
}).select();

console.log(sql);

conn.end();
