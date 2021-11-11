module.exports = (sequelize, Sequelize) => {
  const Info = sequelize.define(
    "status_tol",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "status_tol",
    }
  );
  return Info;
};
