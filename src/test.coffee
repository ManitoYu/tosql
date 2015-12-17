mysql = require 'mysql'
Tosql = require './index'

conn = mysql.createConnection
  host: '192.168.1.100'
  user: 'yucong'
  password: 'yucong'
  database: 'paopao_admin'

conn.connect()

tosql = new Tosql 'resources'
sql = tosql.insert
  name: 'yucong'
  age: 21

console.log sql

# query = (sql) ->
#   new Promise (resolve, reject) ->
#     conn.query sql, (err, result) ->
#       reject err if err
#       resolve result
#
# query 'SELECT * FROM `resources`'
#   .then (result) ->
#     console.log result

conn.end()
