module.exports = (sequelize, Sequelize) => {
  const StatusTolI18n = sequelize.define(
    "status_tol_i18n",
    {
      statusTolUuid: {
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
      tableName: "status_tol_i18n",
      timestamps: false,
    }
  );

  return StatusTolI18n;
};
