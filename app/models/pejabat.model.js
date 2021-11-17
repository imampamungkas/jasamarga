module.exports = (sequelize, Sequelize) => {
  const Pejabat = sequelize.define(
    "pejabat",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tipe: {
        type: Sequelize.ENUM(
          "dewan-komisaris",
          "direksi",
          "corporate-secretary",
          "auditor",
          "komite"
        ),
        defaultValue: "dewan-komisaris",
      },
      kategori: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      nama_file: {
        type: Sequelize.STRING,
        get() {
          const rawValue = this.getDataValue('nama_file');
          if (rawValue) {
            const tmpValue = rawValue.split('/');
            return tmpValue[tmpValue.length - 1];
          }
          return null;
        }
      },
      nama_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.nama_file
            ? `${process.env.BASE_URL}/uploads/${this.getDataValue('nama_file')}`
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

  return Pejabat;
};
