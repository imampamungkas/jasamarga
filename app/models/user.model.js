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
    pekerjaan: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
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
