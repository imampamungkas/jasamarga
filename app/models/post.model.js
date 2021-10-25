module.exports = (sequelize, Sequelize) => {
  const Post = sequelize.define(
    "post",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tipe: {
        type: Sequelize.STRING,
        defaultValue: "beranda",
      },
      nama_file: {
        type: Sequelize.STRING,
      },
      nama_file_updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      nama_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.nama_file
            ? `${process.env.BASE_URL}/uploads/${this.nama_file}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `nama_file_url` value!");
        },
      },
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "post",
    }
  );
  Post.beforeUpdate(async (instance, options) => {
    if (instance.changed("nama_file")) {
      instance.nama_file_updatedAt = new Date();
    }
  });

  return Post;
};
