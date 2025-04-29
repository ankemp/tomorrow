import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class DBService {
  constructor(private sequelize: Sequelize) {
    this.sequelize.sync({ force: true });
  }
}
