module.exports = {
    development: {
      username: "root",
      password: "StrongP@ssw0rd!",
      database: "praka_jakartadb",
      host: "localhost",
      dialect: 'mysql',
      logging: true,
      timezone: '+07:00', 
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
      host:  `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
      dialect: 'mysql',
      dialectOptions: {
        socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
      },
      logging: true,
      timezone: '+07:00', 
    },
  }
  