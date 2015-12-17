var conn, mysql, query, tosql;

mysql = require('mysql');

tosql = require('tosql');

conn = mysql.createConnection({
  host: '192.168.1.100',
  user: 'yucong',
  password: 'yucong',
  database: 'paopao_admin'
});

conn.connect();

query = function(sql) {
  return new Promise(function(resolve, reject) {
    return conn.query(sql, function(err, result) {
      if (err) {
        reject(err);
      }
      return resolve(result);
    });
  });
};

query('SELECT * FROM `resources`').then(function(result) {
  return console.log(result);
});

conn.end();
