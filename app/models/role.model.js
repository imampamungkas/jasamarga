module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("role", {
    nama: {
      type: Sequelize.STRING(150),
      allowNull: false,
      primaryKey: true,
    },
    deskripsi: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
  },
    {
      tableName: "role",
    });
  return Role;
};
