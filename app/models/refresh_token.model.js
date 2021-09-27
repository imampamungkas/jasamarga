module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refresh_tokens", {
    token: {
      type: Sequelize.TEXT,
    },
  });

  return RefreshToken;
};
