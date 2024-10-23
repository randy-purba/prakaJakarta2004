module.exports = (sequelize, DataTypes) => {
    const Wilayah = sequelize.define('Wilayah', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        name: DataTypes.STRING,
    })
    Wilayah.associate = (models) => {
        Wilayah.hasMany(models.Kabupaten)
        Wilayah.hasMany(models.DashboardUser)
    }
    return Wilayah
}