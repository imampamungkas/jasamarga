module.exports = (sequelize, Sequelize) => {
  const Info = sequelize.define(
    "topup_tol",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "topup_tol",
    }
  );
  return Info;
};
