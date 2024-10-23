module.exports = (sequelize, DataTypes) => {
    const OtherSurveyorToken = sequelize.define('OtherSurveyorToken', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      jwtToken: DataTypes.STRING
    })
    OtherSurveyorToken.associate = (models) => {
        OtherSurveyorToken.belongsTo(models.OtherSurveyor, { foreignKey: 'OtherSurveyorId' })
    }
    return OtherSurveyorToken
  }
  