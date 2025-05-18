import { InferAttributes, InferCreationAttributes } from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { SyncedSettingsState } from '@tmrw/data-access-models';

@Table({ tableName: 'Users' })
export class UserEntity
  extends Model<
    InferAttributes<UserEntity>,
    InferCreationAttributes<UserEntity>
  >
  implements SyncedSettingsState
{
  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.JSON,
  })
  syncDevices: Record<string, string>;

  @Column({
    type: DataType.STRING,
  })
  defaultReminderTime: string;

  @Column({
    type: DataType.INTEGER,
  })
  defaultReminderTimeAfterCreation: number;

  @Column({
    type: DataType.STRING,
  })
  defaultReminderCategory: string;

  @Column({
    type: DataType.STRING,
    validate: { isIn: [['always', 'never', 'ask']] },
  })
  defaultReminderState: 'always' | 'never' | 'ask';

  @Column({
    type: DataType.STRING,
  })
  startOfWeek: string;

  @Column({
    type: DataType.NUMBER,
  })
  snoozeTime: number;

  @Column({
    type: DataType.STRING,
  })
  timeFormat: string;

  @Column({
    type: DataType.STRING,
    validate: { isIn: [['always', 'never', 'optional']] },
  })
  timeSpecificity: 'always' | 'never' | 'optional';

  @Column({
    type: DataType.STRING,
    validate: { isIn: [['always', 'never', 'ask']] },
  })
  autoCompleteTasks: 'always' | 'never' | 'ask';

  @Column({
    type: DataType.STRING,
  })
  locale: string;
}
