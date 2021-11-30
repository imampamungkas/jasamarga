module.exports = (sequelize, Sequelize) => {
  const Pencarian = sequelize.define("pencarian", {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    url_link: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    keyword: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
    {
      tableName: "pencarian",
    });
  return Pencarian;
};
