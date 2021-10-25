module.exports = (sequelize, Sequelize) => {
  const Presskit = sequelize.define(
    "presskit",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tipe: {
        type: Sequelize.ENUM(
          "video",
          "foto",
        ),
        defaultValue: "foto",
      },
      presskit_file: {
        type: Sequelize.STRING,
      },
      presskit_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.presskit_file
            ? `${process.env.BASE_URL}/uploads/${this.presskit_file}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `presskit_file_url` value!");
        },
      },
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "presskit",
    }
  );

  return Presskit;
};
