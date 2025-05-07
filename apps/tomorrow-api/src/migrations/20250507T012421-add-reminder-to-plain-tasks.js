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
