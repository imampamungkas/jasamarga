module.exports = (sequelize, Sequelize) => {
  const Info = sequelize.define(
    "alamat_tol",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    },
    {
      tableName: "alamat_tol",
    }
  );
  return Info;
};
