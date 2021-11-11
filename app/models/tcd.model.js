module.exports = (sequelize, Sequelize) => {
  const Tcd = sequelize.define(
    "tcd",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "tcd",
    }
  );
  return Tcd;
};
