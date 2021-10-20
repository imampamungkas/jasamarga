module.exports = (sequelize, Sequelize) => {
  const GalleryI18n = sequelize.define(
    "gallery_i18n",
    {
      galleryUuid: {
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
      tableName: "gallery_i18n",
      timestamps: false,
    }
  );

  return GalleryI18n;
};
