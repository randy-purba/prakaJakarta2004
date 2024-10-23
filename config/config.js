module.exports = {
    development: {
      username: "root",
      password: "StrongP@ssw0rd!",
      database: "praka_jakartadb",
      host: "localhost",
      dialect: 'mysql',
      logging: true,
    },
    test: {
      username: process.env.MY_USER,
      password: process.env.MY_PASS,
      database: process.env.MY_DBN,
      host: process.env.MY_HOST,
      dialect: 'mysql',
    },
    production: {
      username: process.env.MY_USER,
      password: process.env.MY_PASS,
      database: process.env.MY_DBN,
      host:  process.env.MY_HOST,
      dialect: 'mysql',
      dialectOptions: {
        socketPath: `/cloudsql/praka-jakarta-2024:asia-southeast1:praka-jakarta-2024`,
      },
    },
  }
  