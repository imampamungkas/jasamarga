module.exports = (sequelize, Sequelize) => {
  const ResidentialI18n = sequelize.define(
    "residential_i18n",
    {
      residentialUuid: {
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
      luas_lahan: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "residential_i18n",
      timestamps: false,
    }
  );

  return ResidentialI18n;
};
