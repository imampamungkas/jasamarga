module.exports = (sequelize, Sequelize) => {
  const Penghargaan = sequelize.define(
    "penghargaan",
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tahun: {
        type: Sequelize.STRING(4),
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
      status: {
        type: Sequelize.ENUM("draft", "publish", "not publish"),
        defaultValue: "draft",
      },
    },
    {
      tableName: "penghargaan",
    }
  );

  return Penghargaan;
};
