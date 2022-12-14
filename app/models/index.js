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
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.akses = require("./akses.model.js")(sequelize, Sequelize);
db.tokens = require("./token.model.js")(sequelize, Sequelize);
db.refresTokens = require("./refresh_token.model.js")(sequelize, Sequelize);
db.kontak = require("./kontak.model.js")(sequelize, Sequelize);
db.baner = require("./baner.model.js")(sequelize, Sequelize);
db.banerI18n = require("./baner-i18n.model.js")(sequelize, Sequelize);
db.pejabat = require("./pejabat.model.js")(sequelize, Sequelize);
db.pejabatI18n = require("./pejabat-i18n.model.js")(sequelize, Sequelize);
db.penghargaan = require("./penghargaan.model.js")(sequelize, Sequelize);
db.penghargaanI18n = require("./penghargaan-i18n.model.js")(sequelize, Sequelize);
db.asean = require("./asean.model.js")(sequelize, Sequelize);
db.aseanI18n = require("./asean-i18n.model.js")(sequelize, Sequelize);
db.kantor = require("./kantor.model.js")(sequelize, Sequelize);
db.kantorI18n = require("./kantor-i18n.model.js")(sequelize, Sequelize);
db.page = require("./page.model.js")(sequelize, Sequelize);
db.pageI18n = require("./page-i18n.model.js")(sequelize, Sequelize);
db.gallery = require("./gallery.model.js")(sequelize, Sequelize);
db.galleryI18n = require("./gallery-i18n.model.js")(sequelize, Sequelize);
db.post = require("./post.model.js")(sequelize, Sequelize);
db.postI18n = require("./post-i18n.model.js")(sequelize, Sequelize);
db.photo = require("./photo.model.js")(sequelize, Sequelize);
db.photoI18n = require("./photo-i18n.model.js")(sequelize, Sequelize);
db.arearest = require("./arearest.model.js")(sequelize, Sequelize);
db.arearestI18n = require("./arearest-i18n.model.js")(sequelize, Sequelize);
db.simpangsusun = require("./simpangsusun.model.js")(sequelize, Sequelize);
db.simpangsusunI18n = require("./simpangsusun-i18n.model.js")(sequelize, Sequelize);
db.info = require("./info.model.js")(sequelize, Sequelize);
db.infoI18n = require("./info-i18n.model.js")(sequelize, Sequelize);
db.tcd = require("./tcd.model.js")(sequelize, Sequelize);
db.tcdI18n = require("./tcd-i18n.model.js")(sequelize, Sequelize);
db.restArea = require("./rest_area.model")(sequelize, Sequelize);
db.restAreaI18n = require("./rest_area-i18n.model")(sequelize, Sequelize);
db.residential = require("./residential.model")(sequelize, Sequelize);
db.residentialI18n = require("./residential-i18n.model")(sequelize, Sequelize);
db.statusTol = require("./status_tol.model.js")(sequelize, Sequelize);
db.statusTolI18n = require("./status_tol-i18n.model.js")(sequelize, Sequelize);
db.alamatTol = require("./alamat_tol.model.js")(sequelize, Sequelize);
db.alamatTolI18n = require("./alamat_tol-i18n.model.js")(sequelize, Sequelize);
db.topupTol = require("./topup_tol.model.js")(sequelize, Sequelize);
db.topupTolI18n = require("./topup_tol-i18n.model.js")(sequelize, Sequelize);
db.dokumen = require("./dokumen.model.js")(sequelize, Sequelize);
db.dokumenI18n = require("./dokumen-i18n.model.js")(sequelize, Sequelize);
db.presskit = require("./presskit.model.js")(sequelize, Sequelize);
db.presskitI18n = require("./presskit-i18n.model.js")(sequelize, Sequelize);
db.travoy = require("./travoy.model.js")(sequelize, Sequelize);
db.pencarian = require("./pencarian.model")(sequelize, Sequelize);

db.users.hasMany(db.tokens, { as: "tokens" });
db.users.hasMany(db.refresTokens, { as: "refresTokens" });
db.tokens.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.roles.hasMany(db.users, { as: "users" });
db.users.belongsTo(db.roles, {
  foreignKey: "roleNama",
  as: "role",
});

db.roles.hasMany(db.akses, {
  as: "akses_role",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.akses.belongsTo(db.roles, {
  foreignKey: "roleNama",
  as: "akses",
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

db.post.hasMany(db.simpangsusun, {
  as: "simpangsusun",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.simpangsusun.belongsTo(db.post, {
  as: "post",
});

db.post.hasMany(db.arearest, {
  as: "arearest",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.arearest.belongsTo(db.post, {
  as: "post",
});

db.post.hasMany(db.info, {
  as: "info",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.info.belongsTo(db.post, {
  as: "post",
});

db.post.hasMany(db.statusTol, {
  as: "status_tol",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.statusTol.belongsTo(db.post, {
  as: "post",
});

db.post.hasMany(db.topupTol, {
  as: "topup_tol",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.topupTol.belongsTo(db.post, {
  as: "post",
});

db.post.hasMany(db.alamatTol, {
  as: "alamat_tol",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.alamatTol.belongsTo(db.post, {
  as: "post",
});

db.page.hasMany(db.info, {
  as: "info",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.info.belongsTo(db.page, {
  as: "page",
});

db.page.hasMany(db.tcd, {
  as: "tcd",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.tcd.belongsTo(db.page, {
  as: "page",
});

db.page.hasMany(db.restArea, {
  as: "rest_area",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.restArea.belongsTo(db.page, {
  as: "page",
});

db.page.hasMany(db.residential, {
  as: "residential",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.residential.belongsTo(db.page, {
  as: "page",
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

db.simpangsusun.hasMany(db.simpangsusunI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.simpangsusunI18n.belongsTo(db.simpangsusun, {
  as: "simpangsusun",
});

db.arearest.hasMany(db.arearestI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.arearestI18n.belongsTo(db.arearest, {
  as: "arearest",
});

db.info.hasMany(db.infoI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.infoI18n.belongsTo(db.info, {
  as: "info",
});

db.tcd.hasMany(db.tcdI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.tcdI18n.belongsTo(db.tcd, {
  as: "tcd",
});

db.restArea.hasMany(db.restAreaI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.restAreaI18n.belongsTo(db.restArea, {
  as: "rest_area",
});

db.residential.hasMany(db.residentialI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.residentialI18n.belongsTo(db.residential, {
  as: "residential",
});

db.statusTol.hasMany(db.statusTolI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.statusTolI18n.belongsTo(db.statusTol, {
  as: "status_tol",
});

db.topupTol.hasMany(db.topupTolI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.topupTolI18n.belongsTo(db.topupTol, {
  as: "topup_tol",
});

db.alamatTol.hasMany(db.alamatTolI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.alamatTolI18n.belongsTo(db.alamatTol, {
  as: "alamat_tol",
});

db.dokumen.hasMany(db.dokumenI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.dokumenI18n.belongsTo(db.dokumen, {
  as: "dokumen",
});

db.presskit.hasMany(db.presskitI18n, {
  as: "i18n",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.presskitI18n.belongsTo(db.presskit, {
  as: "presskit",
});

module.exports = db;
