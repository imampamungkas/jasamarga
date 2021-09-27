module.exports = (sequelize, Sequelize) => {
  const Pejabat = sequelize.define(
    "pejabat",
    {
      lang: {
        type: Sequelize.STRING(2),
        defaultValue: "id",
      },
      nama: {
        type: Sequelize.STRING,
      },
      deskripsi: {
        type: Sequelize.TEXT,
      },
      jabatan: {
        type: Sequelize.TEXT,
      },
      tipe: {
        type: Sequelize.ENUM(
          "dewan-komisaris",
          "direksi",
          "corporate-secretary",
          "auditor",
          "komite-audit",
          "komite-nominasi-remunerasi",
          "komite-risiko-hukum",
          "komite-pengarah-teknologi-informasi",
          "komite-manajemen-risiko",
          "komite-investasi"
        ),
        defaultValue: "dewan-komisaris",
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
      tableName: "pejabat",
    }
  );
  Pejabat.beforeUpdate(async (instance, options) => {
    if (instance.changed("nama_file")) {
      instance.nama_file_updatedAt = new Date();
    }
  });

  return Pejabat;
};
