module.exports = (sequelize, Sequelize) => {
  const Asean = sequelize.define(
    "asean",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      sumber_link: {
        type: Sequelize.STRING,
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
      tipe_tautan: {
        type: Sequelize.ENUM(
          "file",
          "url",
        ),
        defaultValue: "url",
      },
    },
    {
      tableName: "asean",
    }
  );

  return Asean;
};
