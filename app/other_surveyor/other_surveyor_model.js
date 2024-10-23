module.exports = (sequelize, DataTypes) => {
    const OtherSurveyor = sequelize.define('OtherSurveyor', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        username: DataTypes.STRING,
        password: DataTypes.STRING
    })
    OtherSurveyor.associate = (models) => {
        OtherSurveyor.hasMany(models.OtherReport)
    }
    return OtherSurveyor
}