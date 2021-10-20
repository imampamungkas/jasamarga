const SequelizeSlugify = require("sequelize-slugify");

module.exports = (sequelize, Sequelize) => {
  const Artikel = sequelize.define(
    "artikel",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
      },
      tipe: {
        type: Sequelize.STRING,
        defaultValue: "news",
        allowNull: false,
      },
      judul: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deskripsi: {
        type: Sequelize.TEXT,
      },
      teks: {
        type: Sequelize.TEXT("long"),
      },
      gambar_file: {
        type: Sequelize.STRING,
      },
      gambar_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.gambar_file
            ? `${process.env.BASE_URL}/uploads/${this.gambar_file}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `gambar_file_url` value!");
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
      web_url: {
        type: Sequelize.STRING,
      },
      youtube_url: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "artikel",
    }
  );
  SequelizeSlugify.slugifyModel(Artikel, {
    source: ["judul"],
    suffixSource: ["tipe"],
  });
  return Artikel;
};
