'use strict';

const { Sequelize } = require('sequelize');

exports.up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('Users', 'snoozeTime', {
    type: Sequelize.NUMBER,
    allowNull: true,
    defaultValue: 10,
  });
};

exports.down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('Users', 'snoozeTime');
};
