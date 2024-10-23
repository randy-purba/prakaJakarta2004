module.exports = (sequelize, DataTypes) => {
    const Dapil = sequelize.define('Dapil', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        name: DataTypes.STRING,
    })
    Dapil.associate = (models) => {
        Dapil.hasMany(models.DashboardUser)
        Dapil.belongsTo(models.Kabupaten, { foreignKey: 'KabupatenId' })
    }
    return Dapil
}