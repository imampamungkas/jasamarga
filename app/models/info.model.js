module.exports = (sequelize, Sequelize) => {
  const Info = sequelize.define(
    "info",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "info",
    }
  );
  return Info;
};
