'use strict';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
exports.up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('NotificationSubscriptions', {
    deviceId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    endpoint: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    p256dh: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    auth: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  await queryInterface.createTable('Users', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    syncDevices: Sequelize.JSON,
    defaultReminderTime: Sequelize.STRING,
    defaultReminderTimeAfterCreation: Sequelize.INTEGER,
    defaultReminderCategory: Sequelize.STRING,
    defaultReminderState: {
      type: Sequelize.STRING,
      validate: { isIn: [['always', 'never', 'ask']] },
    },
    startOfWeek: Sequelize.STRING,
    timeFormat: Sequelize.STRING,
    timeSpecificity: {
      type: Sequelize.STRING,
      validate: { isIn: [['always', 'never', 'optional']] },
    },
    autoCompleteTasks: {
      type: Sequelize.STRING,
      validate: { isIn: [['always', 'never', 'ask']] },
    },
    locale: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  });

  await queryInterface.createTable('Notifications', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    taskId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    scheduledAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    isSent: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    metadata: Sequelize.JSON,
    snoozedUntil: Sequelize.DATE,
    snoozeCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  });

  await queryInterface.createTable('EncryptedTasks', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    encryptedData: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  });

  await queryInterface.createTable('PlainTasks', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pinned: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    description: Sequelize.TEXT,
    location: Sequelize.STRING,
    duration: Sequelize.INTEGER,
    subTasks: Sequelize.JSON,
    attachments: Sequelize.JSON,
    timers: Sequelize.JSON,
    notes: Sequelize.TEXT,
    completedAt: Sequelize.DATE,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  });
};

exports.down = async (context) => {
  const { queryInterface } = context;
  await queryInterface.dropTable('PlainTasks');
  await queryInterface.dropTable('EncryptedTasks');
  await queryInterface.dropTable('Notifications');
  await queryInterface.dropTable('Users');
  await queryInterface.dropTable('NotificationSubscriptions');
};
