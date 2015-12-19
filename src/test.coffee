mysql = require 'mysql'
tosql = require './index'

conn = mysql.createConnection
  host: '192.168.1.100'
  user: 'yucong'
  password: 'yucong'
  database: 'paopao_admin'

conn.connect()

table = tosql 'table'
where = [
  { id: [{ gt: 1, lt: 10 }, { like: '%1312%' }], age: { in: ['yucong', 21, 22] } }
  { name: { like: '%yucong%' } }
]
where =  [ { id: { gt: 0, lt: 10 } }, { name: 'yucong' } ]

sql = table.where(null).select()

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
