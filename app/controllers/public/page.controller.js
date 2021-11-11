//@ts-check
const db = require("../../models");
const Page = db.page;
const PageI18n = db.pageI18n;
const Gallery = db.gallery;
const GalleryI18n = db.galleryI18n;
const Info = db.info;
const InfoI18n = db.infoI18n;
const Tcd = db.tcd;
const TcdI18n = db.tcdI18n;

const use_info = [
  'tata-nilai',
];

const use_tcd = [
  'tcd',
];
// Find a single Page with an id
exports.findOne = (req, res) => {
  const slug = req.params.slug;
  const lang = req.query.lang || "id";

  Page.findOne({
    where: { slug: slug },
    include: [
      {
        model: PageI18n,
        as: 'i18n',
        where: { '$i18n.lang$': lang },
      },
      {
        model: Gallery,
        as: 'gallery',
        include: [{
          model: GalleryI18n,
          as: 'i18n',
          where: { '$gallery->i18n.lang$': lang },
        }],
      },
      use_info.includes(slug) ? {
        model: Info,
        as: 'info',
        include: [{
          model: InfoI18n,
          as: 'i18n',
          where: { '$info->i18n.lang$': lang },
        }],
      } : null,
      use_tcd.includes(slug) ? {
        model: Tcd,
        as: 'tcd',
        include: [{
          model: TcdI18n,
          as: 'i18n',
          where: { '$tcd->i18n.lang$': lang },
        }],
      } : null,
    ].filter(function (el) {
      return el != null;
    })
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: `Error retrieving page = ${slug}`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: `Error retrieving page = ${slug}`,
      });
    });
};
