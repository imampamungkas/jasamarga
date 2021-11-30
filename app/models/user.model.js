module.exports = (sequelize, Sequelize) => {
  const bcrypt = require("bcrypt");
  const User = sequelize.define("user", {
    nama_lengkap: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
    alamat_lengkap: {
      type: Sequelize.TEXT,
    },
    jenis_identitas: {
      type: Sequelize.ENUM("KTP", "SIM", "PASPOR"),
      allowNull: false,
    },
    no_identitas: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    file_identitas: {
      type: Sequelize.STRING,
    },
    file_identitas_url: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.file_identitas
          ? `${process.env.BASE_URL}/uploads/${this.file_identitas}`
          : null;
      },
      set(value) {
        throw new Error("Do not try to set the `nama_file_url` value!");
      },
    },
    pekerjaan: {
      type: Sequelize.STRING,
    },
    pekerjaan_lainnya: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    no_hp: {
      type: Sequelize.STRING(50),
      unique: true,
    },
    username: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      is: /^[0-9a-f]{64}$/i,
    },
    last_login: {
      type: Sequelize.DATE,
    },
    is_verified: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });
  User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  User.beforeCreate(async (user, options) => {
    console.log("beforeCreate", user.password);
    if (user.changed("password")) {
      const hashedPassword = await bcrypt.hash(
        user.password,
        bcrypt.genSaltSync(8)
      );
      console.log("hashedPassword", hashedPassword);
      user.password = hashedPassword;
    }
  });
  User.beforeUpdate(async (user, options) => {
    console.log("beforeUpdate", user.password);
    if (user.changed("password")) {
      const hashedPassword = await bcrypt.hash(
        user.password,
        bcrypt.genSaltSync(8)
      );
      console.log("hashedPassword", hashedPassword);
      user.password = hashedPassword;
    }
  });
  return User;
};
