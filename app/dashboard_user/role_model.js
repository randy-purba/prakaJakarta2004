module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING
        },
        name: DataTypes.STRING,
    })
    Role.associate = (models) => {
        Role.hasMany(models.DashboardUser)
    }
    return Role
}
