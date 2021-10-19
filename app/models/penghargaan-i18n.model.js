module.exports = (sequelize, Sequelize) => {
  const PenghargaanI18n = sequelize.define(
    "penghargaan_i18n",
    {
      penghargaanUuid: {
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
      tableName: "penghargaan_i18n",
      timestamps: false,
    }
  );

  return PenghargaanI18n;
};
