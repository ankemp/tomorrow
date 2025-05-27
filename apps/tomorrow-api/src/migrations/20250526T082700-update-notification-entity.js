'use strict';

const { Sequelize } = require('sequelize');

// Enum values from PushNotificationType in notification.model.ts
const PUSH_NOTIFICATION_TYPE_VALUES = ['TASK', 'TEST'];

exports.up = async ({ context: queryInterface }) => {
  // 1. Rename 'message' to 'title' (keep required)
  await queryInterface.renameColumn('Notifications', 'message', 'title');

  // 2. Add 'body' (optional)
  await queryInterface.addColumn('Notifications', 'body', {
    type: Sequelize.STRING,
    allowNull: true,
  });

  // 3. Add 'type' (required, enum)
  await queryInterface.addColumn('Notifications', 'type', {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { isIn: [PUSH_NOTIFICATION_TYPE_VALUES] },
    defaultValue: 'TASK', // Set a default for existing rows
  });
};

exports.down = async ({ context: queryInterface }) => {
  // 1. Remove 'type'
  await queryInterface.removeColumn('Notifications', 'type');

  // 2. Remove 'body'
  await queryInterface.removeColumn('Notifications', 'body');

  // 3. Rename 'title' back to 'message'
  await queryInterface.renameColumn('Notifications', 'title', 'message');
};
