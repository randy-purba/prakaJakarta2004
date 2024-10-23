module.exports = (sequelize, DataTypes) => {
    const Daerah = sequelize.define('Daerah', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        nama: DataTypes.STRING,
    })
    Daerah.associate = (models) => {
        Daerah.hasMany(models.Foto)
    }
    return Daerah
}