import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { PushNotificationType } from '@tmrw/data-access-models';

@Table({ tableName: 'Notifications' })
export class NotificationEntity extends Model<
  InferAttributes<NotificationEntity>,
  InferCreationAttributes<NotificationEntity>
> {
  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column({
    type: DataType.UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  taskId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
  })
  body: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: PushNotificationType;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  scheduledAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isSent: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    validate: { isIn: [['TASK', 'TEST']] },
  })
  metadata: CreationOptional<Record<string, any>>;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  snoozedUntil: CreationOptional<Date>;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  snoozeCount: number;
}
