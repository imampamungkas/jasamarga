module.exports = (sequelize, Sequelize) => {
  const Dokumen = sequelize.define(
    "dokumen",
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
      tahun: {
        type: Sequelize.STRING(4),
        defaultValue: null,
      },
      url_link: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      cover_file: {
        type: Sequelize.STRING,
      },
      cover_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.cover_file
            ? `${process.env.BASE_URL}/uploads/${this.cover_file}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `cover_file_url` value!");
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
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "dokumen",
    }
  );

  return Dokumen;
};
