var Tosql, conn, mysql, sql, tosql;

mysql = require('mysql');

Tosql = require('./index');

conn = mysql.createConnection({
  host: '192.168.1.100',
  user: 'yucong',
  password: 'yucong',
  database: 'paopao_admin'
});

conn.connect();

tosql = new Tosql('resources');

sql = tosql.insert({
  name: 'yucong',
  age: 21
});

console.log(sql);

conn.end();
