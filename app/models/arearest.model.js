module.exports = (sequelize, Sequelize) => {
  const Arearest = sequelize.define(
    "arearest",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      thumbnail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    },
    {
      tableName: "arearest",
    }
  );

  Arearest.beforeSave(async (instance, options) => {
    if (instance.changed("thumbnail")) {
      if (instance.thumbnail) {
        await Arearest.update({ thumbnail: false }, { where: { postUuid: instance.postUuid } })
      }
    }
  });
  return Arearest;
};
