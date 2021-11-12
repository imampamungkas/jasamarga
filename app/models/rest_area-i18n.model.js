module.exports = (sequelize, Sequelize) => {
  const RestAreaI18n = sequelize.define(
    "rest_area_i18n",
    {
      restAreaUuid: {
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
      status: {
        type: Sequelize.STRING,
      },
      luas_lahan: {
        type: Sequelize.STRING,
      },
      tersedia_spbu: {
        type: Sequelize.STRING,
      },
      daerah: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "rest_area_i18n",
      timestamps: false,
    }
  );

  return RestAreaI18n;
};
