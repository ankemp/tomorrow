import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { UserEntity } from '../_db/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserEntity)
    private userRepository: typeof UserEntity,
  ) {}

  async getUser(userId: string) {
    return this.userRepository.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      where: { id: userId },
    });
  }

  async createUser(userId: string, settings: any) {
    const [user] = await this.userRepository.findOrBuild({
      where: { id: userId },
    });

    for (const key in settings) {
      if (key === 'syncDevices') {
        const syncDevices: Record<string, string> =
          user.get('syncDevices') ?? {};
        user.set('syncDevices', {
          ...syncDevices,
          ...settings.syncDevices,
        });
      } else {
        user.set(key as any, settings[key]);
      }
    }

    await user.save();
    return user;
  }

  async deleteUser(userId: string) {
    await this.userRepository.destroy({ where: { id: userId } });
  }
}
