module.exports = (sequelize, Sequelize) => {
  const RestArea = sequelize.define(
    "rest_area",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "rest_area",
    }
  );
  return RestArea;
};
