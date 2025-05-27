'use strict';

const { Sequelize } = require('sequelize');

// Adds the onCreateRedirectTo column to Users, defaulting to 'dashboard' for existing users
exports.up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('Users', 'onCreateRedirectTo', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'task',
    validate: { isIn: [['dashboard', 'task']] },
  });
};

// Removes the onCreateRedirectTo column from Users
exports.down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('Users', 'onCreateRedirectTo');
};
