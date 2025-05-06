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

import { EncryptedTask } from '@tmrw/data-access-models';

@Table({ tableName: 'EncryptedTasks' })
export class EncryptedTaskEntity
  extends Model<
    InferAttributes<EncryptedTaskEntity>,
    InferCreationAttributes<EncryptedTaskEntity>
  >
  implements EncryptedTask
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
    type: DataType.DATE,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  encryptedData: string;
}
