mysql = require 'mysql'
tosql = require './index'

conn = mysql.createConnection
  host: '192.168.1.100'
  user: 'yucong'
  password: 'yucong'
  database: 'paopao_admin'

conn.connect()

table = tosql 'table'
sql = table.where({ id: [{ in: [1, 2, 3] }, { between: [10, 20] }] }).select()

console.log sql

# query = (sql) ->
#   new Promise (resolve, reject) ->
#     conn.query sql, (err, result) ->
#       reject err if err
#       resolve result
#
# query sql
#   .then (result) ->
#     console.log result

conn.end()
