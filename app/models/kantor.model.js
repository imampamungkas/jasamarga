module.exports = (sequelize, Sequelize) => {
  const Kantor = sequelize.define(
    "kantor",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tipe: {
        type: Sequelize.ENUM(
          "utama",
          "kantor-cabang",
          "entitas-anak",
          "entitas-asosiasi"
        ),
        defaultValue: "utama",
      },
      urutan: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      telepon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fax: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "kantor",
    }
  );

  return Kantor;
};
