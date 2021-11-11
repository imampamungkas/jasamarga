module.exports = (sequelize, Sequelize) => {
  const Residential = sequelize.define(
    "residential",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "residential",
    }
  );
  return Residential;
};
