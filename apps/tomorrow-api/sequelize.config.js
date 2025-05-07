module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'tmp/tomorrow.db',
  },
  test: {
    dialect: 'sqlite',
    storage: 'tmp/test.db',
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DB_PATH,
  },
};
