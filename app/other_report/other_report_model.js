module.exports = (sequelize, DataTypes) => {
    const OtherReport = sequelize.define('OtherReport', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        address: DataTypes.STRING,
        lat: DataTypes.STRING,
        lng: DataTypes.STRING,
        images: DataTypes.STRING,
    })
    OtherReport.associate = (models) => {
        OtherReport.belongsTo(models.OtherSurveyor, { foreignKey: 'OtherSurveyorId' })
    }
    return OtherReport
}