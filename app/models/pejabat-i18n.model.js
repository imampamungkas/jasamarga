module.exports = (sequelize, Sequelize) => {
  const PejabatI18n = sequelize.define(
    "pejabat_i18n",
    {
      pejabatUuid: {
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
      jabatan: {
        type: Sequelize.TEXT,
      },
    },
    {
      tableName: "pejabat_i18n",  
      timestamps: false,
    }
  );

  return PejabatI18n;
};
