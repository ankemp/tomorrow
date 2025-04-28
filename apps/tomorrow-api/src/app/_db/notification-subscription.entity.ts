import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'NotificationSubscriptions' })
export class NotificationSubscription extends Model<
  InferAttributes<NotificationSubscription>,
  InferCreationAttributes<NotificationSubscription>
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
  deviceId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  endpoint: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  p256dh: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  auth: string;
}
