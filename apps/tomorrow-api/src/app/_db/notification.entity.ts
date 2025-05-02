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
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  taskId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

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
  })
  metadata: Record<string, any>;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  snoozedUntil: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  snoozeCount: number;
}
