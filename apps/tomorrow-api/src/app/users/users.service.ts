import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async getUser(userId: string) {
    return this.userModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      where: { id: userId },
    });
  }

  async createUser(userId: string, settings: any) {
    const [user] = await this.userModel.findOrBuild({ where: { id: userId } });

    for (const key in settings) {
      if (key === 'syncDevices') {
        // TODO: Fix type
        const syncDevices: any  = user.get('syncDevices') ?? {};
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
    await this.userModel.destroy({ where: { id: userId } });
  }
}