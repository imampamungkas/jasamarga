module.exports = (sequelize, Sequelize) => {
  const Kontak = sequelize.define(
    "kontak",
    {
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      judul: {
        type: Sequelize.STRING,
      },
      pesan: {
        type: Sequelize.TEXT,
      },
    },
    {
      tableName: "kontak",
    }
  );
  return Kontak;
};
