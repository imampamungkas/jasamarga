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
      link_eksternal: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      nama_file: {
        type: Sequelize.STRING,
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
      dokumen_file: {
        type: Sequelize.STRING,
      },
      dokumen_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.dokumen_file
            ? `${process.env.BASE_URL}/uploads/${this.dokumen_file}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `dokumen_file_url` value!");
        },
      },
      urutan: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

  return Post;
};
