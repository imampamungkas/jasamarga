module.exports = (sequelize, Sequelize) => {
  const Dokumen = sequelize.define(
    "dokumen",
    {
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
      },
      tipe: {
        type: Sequelize.ENUM(
          "dokumen-tata-kelola",
          "laporan-gcg",
          "laporan-csr",
          "praktik-csr"
        ),
        defaultValue: "dokumen-tata-kelola",
      },
      judul: {
        type: Sequelize.STRING,
      },
      tahun: {
        type: Sequelize.STRING(4),
        allowNull: true,
        defaultValue: null,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      thumbnail_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.thumbnail
            ? `${process.env.BASE_URL}/uploads/${this.thumbnail}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `thumbnail_url` value!");
        },
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
      tableName: "dokumen",
    }
  );
  Dokumen.beforeUpdate(async (instance, options) => {
    if (instance.changed("nama_file")) {
      instance.nama_file_updatedAt = new Date();
    }
  });

  return Dokumen;
};
