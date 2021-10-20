module.exports = (sequelize, Sequelize) => {
  const Gambar = sequelize.define(
    "gambar",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      judul: {
        type: Sequelize.STRING,
      },
      deskripsi: {
        type: Sequelize.TEXT,
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
      urutan: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "gambar",
    }
  );

  return Gambar;
};
