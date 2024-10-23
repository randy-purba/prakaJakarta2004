module.exports = (sequelize, DataTypes) => {
    const DashboardToken = sequelize.define('DashboardToken', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      jwtToken: DataTypes.STRING
    })
    DashboardToken.associate = (models) => {
        DashboardToken.belongsTo(models.DashboardUser, { foreignKey: 'DashboardUserId' })
    }
    return DashboardToken
  }
  