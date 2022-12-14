//@ts-check
const paginate = require("express-paginate");
const db = require("../../models");
const postConfig = require("../../config/post.config");
const Post = db.post;
const PostI18n = db.postI18n;
const Photo = db.photo;
const PhotoI18n = db.photoI18n;
const Simpangsusun = db.simpangsusun;
const SimpangsusunI18n = db.simpangsusunI18n;
const Arearest = db.arearest;
const ArearestI18n = db.arearestI18n;
const Info = db.info;
const InfoI18n = db.infoI18n;
const StatusTol = db.statusTol;
const StatusTolI18n = db.statusTolI18n;
const AlamatTol = db.alamatTol;
const AlamatTolI18n = db.alamatTolI18n;
const TopupTol = db.topupTol;
const TopupTolI18n = db.topupTolI18n;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  const lang = req.query.lang || "id";
  const nopage = req.query.nopage || 0;
  const search = req.query.search;
  const tipe = req.params.tipe;

  var condition = {
    [Op.and]: [
      postConfig.use_publish.includes(tipe) ? { status: "publish" } : null,
      { tipe: tipe },
    ],
  };

  var condition_i18n = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { '$i18n.nama$': { [Op.like]: `%${search}%` } },
            { '$i18n.deskripsi$': { [Op.like]: `%${search}%` } },
            { '$post.nama_file$': { [Op.like]: `%${search}%` } },
            { '$post.nama_file2$': { [Op.like]: `%${search}%` } },
          ],
        }
        : null,
      { '$i18n.lang$': lang },
    ],
  };
  var include = [
    {
      model: PostI18n,
      as: 'i18n',
      where: condition_i18n,
    },
    {
      model: Photo,
      as: 'photo',
      separate: true,
      include: [{
        model: PhotoI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      }],
    },
    {
      model: Simpangsusun,
      as: 'simpangsusun',
      separate: true,
      include: [{
        model: SimpangsusunI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      }],
    },
    {
      model: Arearest,
      as: 'arearest',
      separate: true,
      include: [{
        model: ArearestI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      }],
    },
    {
      model: Info,
      as: 'info',
      order: [["urutan", "ASC"]],
      separate: true,
      include: [{
        model: InfoI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
        duplicating: true
      }],
    },
    postConfig.use_status_tol.includes(tipe) ? {
      model: StatusTol,
      as: 'status_tol',
      separate: true,
      include: [{
        model: StatusTolI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      }],
    } : null,
    postConfig.use_topup_tol.includes(tipe) ? {
      model: TopupTol,
      as: 'topup_tol',
      separate: true,
      include: [{
        model: TopupTolI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      }],
    } : null,
    postConfig.use_alamat_tol.includes(tipe) ? {
      model: AlamatTol,
      as: 'alamat_tol',
      separate: true,
      include: [{
        model: AlamatTolI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      }],
    } : null,
  ].filter(function (el) {
    return el != null;
  })
  var query =
    nopage == 1
      ? Post.findAll({
        where: condition,
        include: include,
        order: [["createdAt", "DESC"]],
      })
      : Post.findAndCountAll({
        where: condition,
        include: include,
        limit: req.query.limit,
        offset: req.skip,
        order: [["createdAt", "DESC"]],
      });
  query
    .then((results) => {
      if (nopage == 1) {
        res.send(results);
      } else {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / req.query.limit);
        res.send({
          results: results.rows,
          pageCount,
          itemCount,
          pages: paginate.getArrayPages(req)(req.query.limit, pageCount, req.query.page),
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single Post with an id
exports.findOne = (req, res) => {
  const uuid = req.params.uuid;
  const tipe = req.params.tipe;
  const lang = req.query.lang || "id";
  var condition = { uuid: uuid, tipe: tipe };
  if (postConfig.use_publish.includes(tipe)) {
    condition["status"] = "publish";
  }
  Post.findOne({
    where: condition,
    include: [
      {
        model: PostI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      },
      {
        model: Photo,
        as: 'photo',
        separate: true,
        include: [{
          model: PhotoI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      },
      {
        model: Simpangsusun,
        as: 'simpangsusun',
        separate: true,
        include: [{
          model: SimpangsusunI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      },
      {
        model: Arearest,
        as: 'arearest',
        separate: true,
        include: [{
          model: ArearestI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      },
      {
        model: Info,
        as: 'info',
        order: [["urutan", "ASC"]],
        separate: true,
        include: [{
          model: InfoI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      },
      postConfig.use_status_tol.includes(tipe) ? {
        model: StatusTol,
        as: 'status_tol',
        separate: true,
        include: [{
          model: StatusTolI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      } : null,
      postConfig.use_topup_tol.includes(tipe) ? {
        model: TopupTol,
        as: 'topup_tol',
        separate: true,
        include: [{
          model: TopupTolI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      } : null,
      postConfig.use_alamat_tol.includes(tipe) ? {
        model: AlamatTol,
        as: 'alamat_tol',
        separate: true,
        include: [{
          model: AlamatTolI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      } : null,
    ].filter(function (el) {
      return el != null;
    }),
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving ${tipe} with uuid = ${uuid}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: `Error retrieving ${tipe} with uuid = ${uuid}`,
      });
    });
};
