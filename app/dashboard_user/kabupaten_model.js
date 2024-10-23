module.exports = (sequelize, DataTypes) => {
    const Kabupaten = sequelize.define('Kabupaten', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        name: DataTypes.STRING,
    })
    Kabupaten.associate = (models) => {
        Kabupaten.hasMany(models.Dapil)
        Kabupaten.hasMany(models.DashboardUser)
        Kabupaten.belongsTo(models.Wilayah, { foreignKey: 'WilayahId' })
    }
    return Kabupaten
}