const SequelizeSlugify = require("sequelize-slugify");

module.exports = (sequelize, Sequelize) => {
  const Media = sequelize.define(
    "media",
    {
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
        primaryKey: true,
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
      },
      tipe: {
        type: Sequelize.ENUM("video", "miles-magazine", "foto"),
        defaultValue: "video",
      },
      judul: {
        type: Sequelize.STRING,
      },
      teks: {
        type: Sequelize.TEXT,
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
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "informasi",
    }
  );
  SequelizeSlugify.slugifyModel(Informasi, {
    source: ["judul"],
    suffixSource: ["lang"],
  });
  return Informasi;
};
