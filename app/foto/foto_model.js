module.exports = (sequelize, DataTypes) => {
    const Foto = sequelize.define('Foto', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        photo: DataTypes.STRING,
        keterangan: DataTypes.TEXT
    })
    Foto.associate = (models) => {
        Foto.belongsTo(models.Daerah, { foreignKey: 'DaerahId' })
        Foto.belongsTo(models.Kegiatan, { foreignKey: 'KegiatanId' })
    }
    return Foto
}