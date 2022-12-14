module.exports = (sequelize, Sequelize) => {
  const PageI18n = sequelize.define(
    "page_i18n",
    {
      pageSlug: {
        type: Sequelize.STRING,
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
      info_gerbang: {
        type: Sequelize.TEXT("long"),
      },
      visi: {
        type: Sequelize.TEXT,
      },
      misi: {
        type: Sequelize.TEXT,
      },
    },
    {
      tableName: "page_i18n",
      timestamps: false,
    }
  );

  return PageI18n;
};
