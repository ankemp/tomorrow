import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import fs from 'fs';
import helmet from 'helmet';
import path from 'path';
import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';

import { AppModule } from './app/app.module';

async function runMigrations() {
  if (process.env['NODE_ENV'] === 'production' && !process.env['DB_PATH']) {
    throw new Error('DB_PATH is not set in production');
  }

  const logger = new Logger('Migrations');

  const dbPath = process.env['DB_PATH'] || ':memory:';
  if (dbPath !== ':memory:') {
    const resolvedPath = path.resolve(dbPath);
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      fs.writeFileSync(resolvedPath, '');
      fs.chmodSync(resolvedPath, 0o600);
      logger.log(`Created database file at ${resolvedPath}`);
    }
  }

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
  });

  const umzug = new Umzug({
    migrations: {
      glob: ['migrations/*.js', { cwd: __dirname }],
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: {
      info: (message) => logger.log(message),
      warn: (message) => logger.warn(message),
      error: (message) => logger.error(message),
      debug: (message) => logger.debug(message),
    },
  });

  const migrations = await umzug.pending();
  if (migrations.length > 0) {
    logger.log(
      `🚀 Running migrations: ${migrations.map((m) => m.name).join(', ')}`,
    );
  } else {
    logger.log('🚀 No pending migrations');
  }

  await umzug.up();
}

async function bootstrap() {
  await runMigrations();
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'script-src-attr': ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📦 Static files are served from: ${process.cwd()}/static at http://localhost:3000`,
  );
}

bootstrap();
