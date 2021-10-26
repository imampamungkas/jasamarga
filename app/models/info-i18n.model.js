module.exports = (sequelize, Sequelize) => {
  const InfoI18n = sequelize.define(
    "info_i18n",
    {
      infoUuid: {
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
      tableName: "info_i18n",
      timestamps: false,
    }
  );

  return InfoI18n;
};
