import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'EncryptedTasks' })
export class EncryptedTask extends Model<
  InferAttributes<EncryptedTask>,
  InferCreationAttributes<EncryptedTask>
> {
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
    type: DataType.TEXT,
    allowNull: false,
  })
  encryptedData: string;
}

export const ENCRYPTED_TASK = 'ENCRYPTED_TASK_REPOSITORY';
export const encryptedTaskProvider = {
  provide: ENCRYPTED_TASK,
  useValue: EncryptedTask,
};
