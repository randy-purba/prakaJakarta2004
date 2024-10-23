module.exports = (sequelize, DataTypes) => {
    const AppToken = sequelize.define('AppToken', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      jwtToken: DataTypes.STRING
    })
    AppToken.associate = (models) => {
        AppToken.belongsTo(models.AppUser, { foreignKey: 'AppUserId' })
    }
    return AppToken
  }
  