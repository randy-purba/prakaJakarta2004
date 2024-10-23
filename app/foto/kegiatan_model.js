module.exports = (sequelize, DataTypes) => {
    const Kegiatan = sequelize.define('Kegiatan', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        nama: DataTypes.STRING,
    })
    Kegiatan.associate = (models) => {
        Kegiatan.hasMany(models.Foto)
    }
    return Kegiatan
}