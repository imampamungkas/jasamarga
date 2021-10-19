module.exports = (sequelize, Sequelize) => {
  const BanerI18n = sequelize.define(
    "baner_i18n",
    {
      banerUuid: {
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
      tableName: "baner_i18n",
      timestamps: false,
    }
  );

  return BanerI18n;
};
