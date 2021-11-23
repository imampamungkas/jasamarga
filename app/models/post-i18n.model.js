module.exports = (sequelize, Sequelize) => {
  const PostI18n = sequelize.define(
    "post_i18n",
    {
      postUuid: {
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
      teks: {
        type: Sequelize.TEXT("long"),
      },
      status_ruas_jalan: {
        type: Sequelize.TEXT,
      },
      bujt: {
        type: Sequelize.STRING,
      },
      panjang: {
        type: Sequelize.STRING,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
      nama_usaha: {
        type: Sequelize.STRING,
      },
      kategori_usaha: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "post_i18n",
      timestamps: false,
    }
  );

  return PostI18n;
};
