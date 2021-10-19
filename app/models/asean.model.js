module.exports = (sequelize, Sequelize) => {
  const Asean = sequelize.define(
    "asean",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      sumber_link: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "asean",
    }
  );

  return Asean;
};
