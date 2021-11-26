//@ts-check
const db = require("../../models");
const pageConfig = require("../../config/page.config");
const Page = db.page;
const PageI18n = db.pageI18n;
const Gallery = db.gallery;
const GalleryI18n = db.galleryI18n;
const Info = db.info;
const InfoI18n = db.infoI18n;
const Tcd = db.tcd;
const TcdI18n = db.tcdI18n;
const RestArea = db.restArea;
const RestAreaI18n = db.restAreaI18n;
const Residential = db.residential;
const ResidentialI18n = db.residentialI18n;

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
        separate: true,
        include: [{
          model: GalleryI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      },
      pageConfig.use_info.includes(slug) ? {
        model: Info,
        as: 'info',
        order: [["urutan", "ASC"]],
        separate: true,
        include: [{
          model: InfoI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      } : null,
      pageConfig.use_tcd.includes(slug) ? {
        model: Tcd,
        as: 'tcd',
        separate: true,
        include: [{
          model: TcdI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      } : null,
      pageConfig.use_rest_area.includes(slug) ? {
        model: RestArea,
        as: 'rest_area',
        separate: true,
        include: [{
          model: RestAreaI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
        }],
      } : null,
      pageConfig.use_residential.includes(slug) ? {
        model: Residential,
        as: 'residential',
        separate: true,
        include: [{
          model: ResidentialI18n,
          as: 'i18n',
          where: { '$i18n.lang$': lang },
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
