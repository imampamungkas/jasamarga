module.exports = (sequelize, Sequelize) => {
  const Info = sequelize.define(
    "info",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      urutan: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "info",
    }
  );
  return Info;
};
