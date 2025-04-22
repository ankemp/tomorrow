import { Sequelize } from 'sequelize-typescript';

import { EncryptedTask } from './encrypted_task.entity';
import { PlainTask } from './plain_task.entity';
import { User } from './user.entity';

const isDevMode =
  !process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        storage: process.env['DB_PATH'] || ':memory:',
        dialect: 'sqlite',
        logging: isDevMode ? console.log : false,
      });
      sequelize.addModels([PlainTask, EncryptedTask, User]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
