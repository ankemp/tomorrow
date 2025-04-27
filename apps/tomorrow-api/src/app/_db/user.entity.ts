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

@Table({ tableName: 'Users' })
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column({
    type: DataType.STRING,
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
    type: DataType.STRING,
  })
  defaultReminderCategory: string;

  @Column({
    type: DataType.STRING,
  })
  startOfWeek: string;

  @Column({
    type: DataType.STRING,
  })
  timeFormat: string;

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
