module.exports = (sequelize, Sequelize) => {
  const Asean = sequelize.define(
    "asean",
    {
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
      },
      grup: {
        type: Sequelize.STRING,
      },
      no_ref: {
        type: Sequelize.STRING,
      },
      pertanyaan: {
        type: Sequelize.TEXT,
      },
      implementasi: {
        type: Sequelize.TEXT,
      },
      sumber_judul: {
        type: Sequelize.STRING,
      },
      sumber_link: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "asean",
    }
  );

  return Asean;
};
