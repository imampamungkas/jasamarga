module.exports = (sequelize, Sequelize) => {
  const KantorI18n = sequelize.define(
    "kantor_i18n",
    {
      kantorUuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
        primaryKey: true,
      },
      nama_kantor: {
        type: Sequelize.STRING,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
    },
    {
      tableName: "kantor_i18n",
      timestamps: false,
    }
  );

  return KantorI18n;
};
