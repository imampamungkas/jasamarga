module.exports = (sequelize, Sequelize) => {
  const TopupTolI18n = sequelize.define(
    "topup_tol_i18n",
    {
      topupTolUuid: {
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
      panjang: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      status_pembebasan: {
        type: Sequelize.STRING,
      },
      status_konstruksi: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "topup_tol_i18n",
      timestamps: false,
    }
  );

  return TopupTolI18n;
};
