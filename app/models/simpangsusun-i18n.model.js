module.exports = (sequelize, Sequelize) => {
  const SimpangSusunI18n = sequelize.define(
    "simpangsusun_i18n",
    {
      simpangsusunUuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
        primaryKey: true,
      },
      nama: {
        type: Sequelize.STRING,
      },
      deskripsi: {
        type: Sequelize.TEXT,
      },
    },
    {
      tableName: "simpangsusun_i18n",
      timestamps: false,
    }
  );

  return SimpangSusunI18n;
};
