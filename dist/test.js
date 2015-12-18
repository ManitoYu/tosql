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

sql = table.field(['id', 'name']).select();

console.log(sql);

conn.end();
