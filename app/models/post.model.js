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
      dokumen_file: {
        type: Sequelize.STRING,
        get() {
          const rawValue = this.getDataValue('dokumen_file');
          if (rawValue) {
            const tmpValue = rawValue.split('/');
            return tmpValue[tmpValue.length - 1];
          }
          return null;
        }
      },
      dokumen_file_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.dokumen_file
            ? `${process.env.BASE_URL}/uploads/${this.getDataValue('dokumen_file')}`
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
