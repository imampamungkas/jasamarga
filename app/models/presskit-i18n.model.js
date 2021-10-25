module.exports = (sequelize, Sequelize) => {
  const PresskitI18n = sequelize.define(
    "presskit_i18n",
    {
      presskitUuid: {
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
      tableName: "presskit_i18n",
      timestamps: false,
    }
  );

  return PresskitI18n;
};
