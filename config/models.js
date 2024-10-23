const Sequelize = require('sequelize');
const config = require('./config')[process.env.NODE_ENV || 'development']

const sequelize = new Sequelize(config.database, config.username, config.password, config)

// Authenticate the connection
const authenticateDatabase = async () => {
  try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
  } catch (error) {
      console.error('Unable to connect to the database:', error);
  }
};

// Call the authentication function
authenticateDatabase();

// Import models
const AppUser = require('../app/app_user/app_user_model')(sequelize, Sequelize.DataTypes);
const AppToken = require('../app/app_token/app_token_model')(sequelize, Sequelize.DataTypes);
const DashboardToken = require('../app/dashboard_token/dashboard_token_model')(sequelize, Sequelize.DataTypes);
const DashboardUser = require('../app/dashboard_user/dashboard_user_model')(sequelize, Sequelize.DataTypes);
const Report = require('../app/report/report_model')(sequelize, Sequelize.DataTypes);
const Role = require('../app/dashboard_user/role_model')(sequelize, Sequelize.DataTypes);
const Wilayah = require('../app/dashboard_user/wilayah_model')(sequelize, Sequelize.DataTypes);
const Kabupaten = require('../app/dashboard_user/kabupaten_model')(sequelize, Sequelize.DataTypes);
const Dapil = require('../app/dashboard_user/dapil_model')(sequelize, Sequelize.DataTypes);
const OtherSurveyor = require('../app/other_surveyor/other_surveyor_model')(sequelize, Sequelize.DataTypes);
const OtherSurveyorToken = require('../app/other_surveyor_token/other_surveyor_token_model')(sequelize, Sequelize.DataTypes);
const OtherReport = require('../app/other_report/other_report_model')(sequelize, Sequelize.DataTypes);
const Kegiatan = require('../app/foto/kegiatan_model')(sequelize, Sequelize.DataTypes);
const Daerah = require('../app/foto/daerah_model')(sequelize, Sequelize.DataTypes);
const Foto = require('../app/foto/foto_model')(sequelize, Sequelize.DataTypes);


// Export the models and Sequelize instance
const models = {
    AppUser,
    AppToken,
    DashboardToken,
    DashboardUser,
    Report,
    Role,
    Wilayah,
    Kabupaten,
    Dapil,
    OtherSurveyor,
    OtherSurveyorToken,
    OtherReport,
    Kegiatan,
    Daerah,
    Foto
};

// Sync the models with the database (optional, depending on your workflow)
// const syncModels = async () => {
//     try {
//         await sequelize.sync(); // Use { force: true } if you want to drop existing tables
//         console.log("All models were synchronized successfully.");
//     } catch (error) {
//         console.error("Error synchronizing models:", error);
//     }
// };

// // Call the sync function
// syncModels();


// Export sequelize and models for use in other parts of your application
// module.exports = { sequelize, models };


Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

models.sequelize = sequelize
models.Sequelize = Sequelize
module.exports = models

