module.exports = (sequelize, Sequelize) => {
  const Gallery = sequelize.define(
    "gallery",
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
    },
    {
      tableName: "gallery",
    }
  );

  Gallery.beforeSave(async (instance, options) => {
    if (instance.changed("thumbnail")) {
      if (instance.thumbnail) {
        await Gallery.update({ thumbnail: false }, { where: { pageSlug: instance.pageSlug } })
      }
    }
  });
  return Gallery;
};
