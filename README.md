## Introduction

This is a new tool for building sql.

I will try my best to complete it.

If you feel that the tool gives you some help, I hope you can star me[ManitoYu](https://github.com/ManitoYu/tosql).

## Examples

```js
var tosql = require('tosql');
var test = tosql('test');
```

### Insert

```js
var sql = test.insert({ name: 'your name', age: 21 });
console.log(sql); // INSERT INTO `test` (`your name`, `age`) VALUES ('yucong', 21)
```

### Field

```js
var sql = test.field(['id', 'name']).select();
console.log(sql); // SELECT `id`, `name` FROM `table`
```
