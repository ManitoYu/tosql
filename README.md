[![tosql](http://www.onionkings.com/tosql.png)](https://github.com/ManitoYu/tosql)

## Introduction

This is a new tool for building sql.  
I will try my best to complete it.  
If you feel that the tool gives you some help, I hope you can star me [ManitoYu](https://github.com/ManitoYu/tosql).

## Examples

```js
var tosql = require('tosql');
var table = tosql('table');
```

### Insert

```js
var sql = table.insert({ name: 'your name', age: 21 });
console.log(sql); // INSERT INTO `table` (`your name`, `age`) VALUES ('yucong', 21)
```

### Field

```js
var sql = table.field(['id', 'name']).select();
console.log(sql); // SELECT `id`, `name` FROM `table`
```

### Where

- ne
- le
- ge
- eq
- gt
- lt
- like
- between
- in

```js
table.where({ id: { ne: 1 } }).select(); // SELECT * FROM `table` WHERE `id` != 1
table.where({ id: { ge: 1, le: 10 } }).select(); // SELECT * FROM `table` WHERE `id` >= 1 AND `id` <= 10
table.where({ name: { like: '%name%' } }).select(); // SELECT * FROM `table` WHERE `name` LIKE '%name%'
table.where([{ id: 1 }, { name: 'name' }]).select(); // SELECT * FROM `table` WHERE (`id` = 1) OR (`name` = 'name')
table.where({ id: 1, name: 'name' }).select(); // SELECT * FROM `table` WHERE `id` = 1 AND `name` = 'name'
table.where({ id: [{ in: [1, 2, 3] }, { between: [10, 20] }] }).select(); // SELECT * FROM `table` WHERE ((`id` IN (1, 2, 3)) OR (`id` BETWEEN 10 AND 20))
```

### Delete

```js
table.where({ id: 1 }).delete(); // DELETE FROM `table` WHERE `id` = 1
```

If you create a model with primary key, you can do this more easier.
```js
var table = tosql('table', 'id');
table.delete(1); // DELETE FROM `table` WHERE `id` = 1
```

### Update

```js
table.where({ id: 1 }).update({ age: 21 }); // UPDATE `table` SET `age` = 21 WHERE `id` = 1
```

The same as delete, you can also do it as follow.
```js
var table = tosql('table', 'id');
table.update({ name: 'name' }, 1); // UPDATE `table` SET `name` = 'name' WHERE `id` = 1
```

### Join

```js
tosql.relations([
  { table: 'table1_id', table1: 'id' }
]);
tosql.config('table', { alias: 't' });
tosql.config('table1', { alias: 't1' });
var table = tosql('table');
table.join('table1').where({ 't.id': 1 }).select(); // SELECT * FROM `table` `t` LEFT JOIN `table1` `t1` ON `t1`.`id` = `t`.`table1_id` WHERE `t`.`id` = 1
```
