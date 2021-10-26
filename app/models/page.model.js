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
      tahun: {
        type: Sequelize.STRING(4),
        defaultValue: null,
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
    },
    {
      tableName: "page",
    }
  );

  return Page;
};
