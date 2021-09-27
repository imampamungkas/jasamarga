module.exports = (sequelize, Sequelize) => {
  const Kantor = sequelize.define(
    "kantor",
    {
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
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
      kantor: {
        type: Sequelize.STRING,
      },
      alamat: {
        type: Sequelize.TEXT,
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
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "kantor",
    }
  );

  return Kantor;
};
