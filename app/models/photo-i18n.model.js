module.exports = (sequelize, Sequelize) => {
  const PhotoI18n = sequelize.define(
    "photo_i18n",
    {
      photoUuid: {
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
      tableName: "photo_i18n",
      timestamps: false,
    }
  );

  return PhotoI18n;
};
