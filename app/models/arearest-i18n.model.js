module.exports = (sequelize, Sequelize) => {
  const AreaRestI18n = sequelize.define(
    "arearest_i18n",
    {
      arearestUuid: {
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
      tableName: "arearest_i18n",
      timestamps: false,
    }
  );

  return AreaRestI18n;
};
