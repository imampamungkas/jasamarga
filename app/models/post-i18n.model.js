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
    },
    {
      tableName: "post_i18n",
      timestamps: false,
    }
  );

  return PostI18n;
};
