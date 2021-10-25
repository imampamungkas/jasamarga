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
db.page = require("./page.model.js")(sequelize, Sequelize);
db.pageI18n = require("./page-i18n.model.js")(sequelize, Sequelize);
db.gallery = require("./gallery.model.js")(sequelize, Sequelize);
db.galleryI18n = require("./gallery-i18n.model.js")(sequelize, Sequelize);
db.post = require("./post.model.js")(sequelize, Sequelize);
db.postI18n = require("./post-i18n.model.js")(sequelize, Sequelize);
db.photo = require("./photo.model.js")(sequelize, Sequelize);
db.photoI18n = require("./photo-i18n.model.js")(sequelize, Sequelize);
db.tokens = require("./token.model.js")(sequelize, Sequelize);
db.refresTokens = require("./refresh_token.model.js")(sequelize, Sequelize);

db.users.hasMany(db.tokens, { as: "tokens" });
db.users.hasMany(db.refresTokens, { as: "refresTokens" });
db.tokens.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.page.hasMany(db.gallery, {
  as: "gallery",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.gallery.belongsTo(db.page, {
  as: "page",
});

db.post.hasMany(db.photo, {
  as: "photo",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.photo.belongsTo(db.post, {
  as: "post",
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

db.page.hasMany(db.pageI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.pageI18n.belongsTo(db.page, {
  as: "page",
});

db.gallery.hasMany(db.galleryI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.galleryI18n.belongsTo(db.gallery, {
  as: "gallery",
});

db.post.hasMany(db.postI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.postI18n.belongsTo(db.post, {
  as: "post",
});

db.photo.hasMany(db.photoI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.photoI18n.belongsTo(db.photo, {
  as: "photo",
});

module.exports = db;
