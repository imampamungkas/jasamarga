const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.infografis = require("./infografis.model.js")(sequelize, Sequelize);
db.pejabat = require("./pejabat.model.js")(sequelize, Sequelize);
db.penghargaan = require("./penghargaan.model.js")(sequelize, Sequelize);
db.dokumen = require("./dokumen.model.js")(sequelize, Sequelize);
db.asean = require("./asean.model.js")(sequelize, Sequelize);
db.kantor = require("./kantor.model.js")(sequelize, Sequelize);
db.news = require("./informasi.model.js")(sequelize, Sequelize);
db.tokens = require("./token.model.js")(sequelize, Sequelize);
db.refresTokens = require("./refresh_token.model.js")(sequelize, Sequelize);

db.users.hasMany(db.tokens, { as: "tokens" });
db.users.hasMany(db.refresTokens, { as: "refresTokens" });
db.tokens.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

module.exports = db;
