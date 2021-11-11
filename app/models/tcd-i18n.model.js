module.exports = (sequelize, Sequelize) => {
  const TcdI18n = sequelize.define(
    "tcd_i18n",
    {
      tcdUuid: {
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
      luas_lahan: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "tcd_i18n",
      timestamps: false,
    }
  );

  return TcdI18n;
};
