module.exports = (sequelize, Sequelize) => {
  const AseanI18n = sequelize.define(
    "asean_i18n",
    {
      aseanUuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
        primaryKey: true,
      },
      grup: {
        type: Sequelize.STRING,
      },
      no_ref: {
        type: Sequelize.STRING,
      },
      pertanyaan: {
        type: Sequelize.TEXT,
      },
      implementasi: {
        type: Sequelize.TEXT,
      },
      sumber_judul: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "asean_i18n",
      timestamps: false,
    }
  );

  return AseanI18n;
};
