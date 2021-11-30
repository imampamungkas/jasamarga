module.exports = (sequelize, Sequelize) => {
  const Akses = sequelize.define("akses", {
    nama: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
    url_link: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
  },
    {
      tableName: "akses",
    });
  return Akses;
};
