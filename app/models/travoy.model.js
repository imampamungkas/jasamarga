module.exports = (sequelize, Sequelize) => {
  const Travoy = sequelize.define("travoy", {
    asal: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    latitude_asal: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    longitude_asal: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    tujuan: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    latitude_akhir: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    longitude_akhir: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    gol1: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    gol2: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    gol3: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    gol4: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    gol5: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    gol6: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    keterangan: {
      type: Sequelize.TEXT,
      defaultValue: null,
    },
    sistem: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
  },
    {
      tableName: "travoy",
    }
  );
  return Travoy;
};
