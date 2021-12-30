module.exports = (sequelize, Sequelize) => {
  const Page = sequelize.define(
    "page",
    {
      slug: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      link_eksternal: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      link_video: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      tahun: {
        type: Sequelize.STRING(4),
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
      nama_file2: {
        type: Sequelize.STRING,
        get() {
          const rawValue = this.getDataValue('nama_file2');
          if (rawValue) {
            const tmpValue = rawValue.split('/');
            return tmpValue[tmpValue.length - 1];
          }
          return null;
        }
      },
      nama_file2_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.nama_file2
            ? `${process.env.BASE_URL}/uploads/${this.getDataValue('nama_file2')}`
            : null;
        },
        set(value) {
          throw new Error("Do not try to set the `nama_file2_url` value!");
        },
      },
    },
    {
      tableName: "page",
    }
  );

  return Page;
};
