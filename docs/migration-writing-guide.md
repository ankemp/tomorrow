# Migration Writing Guide

This document provides guidelines and examples for creating and writing migrations in the project.

## General Guidelines

1. **File Naming Convention**:

   - Use the format `YYYYMMDDTHHmmss-description.js` for migration files.
   - Example: `20250507T012421-add-reminder-to-plain-tasks.js`.

2. **Structure**:

   - Each migration file should export two functions: `up` and `down`.
   - The `up` function defines the changes to apply to the database.
   - The `down` function defines how to revert those changes.

3. **Database Operations**:

   - Use the `queryInterface` object to perform database operations such as adding or removing columns, creating or dropping tables, etc.
   - Use Sequelize data types for defining column types.

4. **Error Handling**:
   - Ensure that all operations are wrapped in `async` functions to handle asynchronous behavior properly.

## Example Migration

Below is an example migration for adding a `reminder` column to the `PlainTasks` table:

```javascript
'use strict';

const { Sequelize } = require('sequelize');

exports.up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('PlainTasks', 'reminder', {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  });
};

exports.down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('PlainTasks', 'reminder');
};
```

## Best Practices

- **Atomic Changes**: Each migration should focus on a single change to ensure clarity and ease of debugging.
- **Reversible Migrations**: Always implement the `down` function to allow rolling back changes if needed.
- **Testing**: Test migrations in a development environment before applying them to production.
- **Documentation**: Include comments in the migration file to explain the purpose of the changes.

## Common Operations

### Adding a Column

```javascript
await queryInterface.addColumn('TableName', 'ColumnName', {
  type: Sequelize.DataType,
  allowNull: true / false,
  defaultValue: value, // Optional
});
```

### Removing a Column

```javascript
await queryInterface.removeColumn('TableName', 'ColumnName');
```

### Creating a Table

```javascript
await queryInterface.createTable('TableName', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  columnName: {
    type: Sequelize.DataType,
    allowNull: true / false,
  },
});
```

### Dropping a Table

```javascript
await queryInterface.dropTable('TableName');
```

By following these guidelines, you can ensure consistency and reliability in your database migrations.
