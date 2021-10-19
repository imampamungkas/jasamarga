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
db.baner = require("./baner.model.js")(sequelize, Sequelize);
db.banerI18n = require("./baner-i18n.model.js")(sequelize, Sequelize);
db.pejabat = require("./pejabat.model.js")(sequelize, Sequelize);
db.pejabatI18n = require("./pejabat-i18n.model.js")(sequelize, Sequelize);
db.penghargaan = require("./penghargaan.model.js")(sequelize, Sequelize);
db.penghargaanI18n = require("./penghargaan-i18n.model.js")(sequelize, Sequelize);
db.dokumen = require("./dokumen.model.js")(sequelize, Sequelize);
db.asean = require("./asean.model.js")(sequelize, Sequelize);
db.aseanI18n = require("./asean-i18n.model.js")(sequelize, Sequelize);
db.kantor = require("./kantor.model.js")(sequelize, Sequelize);
db.kantorI18n = require("./kantor-i18n.model.js")(sequelize, Sequelize);
db.kontak = require("./kontak.model.js")(sequelize, Sequelize);
db.artikel = require("./artikel.model.js")(sequelize, Sequelize);
db.gambar = require("./gambar.model.js")(sequelize, Sequelize);
db.tokens = require("./token.model.js")(sequelize, Sequelize);
db.refresTokens = require("./refresh_token.model.js")(sequelize, Sequelize);

db.users.hasMany(db.tokens, { as: "tokens" });
db.users.hasMany(db.refresTokens, { as: "refresTokens" });
db.tokens.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.artikel.hasMany(db.gambar, {
  as: "gambar",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.gambar.belongsTo(db.artikel, {
  foreignKey: "artikelUuid",
  as: "artikel",
});

// i18n relation
db.pejabat.hasMany(db.pejabatI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.pejabatI18n.belongsTo(db.pejabat, {
  as: "pejabat",
});

db.penghargaan.hasMany(db.penghargaanI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.penghargaanI18n.belongsTo(db.penghargaan, {
  as: "penghargaan",
});

db.asean.hasMany(db.aseanI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.aseanI18n.belongsTo(db.asean, {
  as: "asean",
});

db.kantor.hasMany(db.kantorI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.kantorI18n.belongsTo(db.kantor, {
  as: "kantor",
});

db.baner.hasMany(db.banerI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.banerI18n.belongsTo(db.baner, {
  as: "baner",
});

module.exports = db;
