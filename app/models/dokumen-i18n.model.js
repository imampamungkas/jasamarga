module.exports = (sequelize, Sequelize) => {
  const DokumenI18n = sequelize.define(
    "dokumen_i18n",
    {
      dokumenUuid: {
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
      tableName: "dokumen_i18n",
      timestamps: false,
    }
  );

  return DokumenI18n;
};
