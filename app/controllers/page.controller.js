//@ts-check
const fs = require("fs");
const db = require("../models");
const pageConfig = require("../config/page.config");

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

// Find a single Page with an slug
exports.findOne = (req, res) => {
  const slug = req.params.slug;

  Page.findOne({
    where: { slug: slug },
    include: [
      {
        model: PageI18n,
        as: 'i18n',
      },
      {
        model: Gallery,
        as: 'gallery',
        include: [{
          model: GalleryI18n,
          as: 'i18n',
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
        }],
      } : null,
      pageConfig.use_tcd.includes(slug) ? {
        model: Tcd,
        as: 'tcd',
        include: [{
          model: TcdI18n,
          as: 'i18n',
        }],
      } : null,
      pageConfig.use_rest_area.includes(slug) ? {
        model: RestArea,
        as: 'rest_area',
        include: [{
          model: RestAreaI18n,
          as: 'i18n',
        }],
      } : null,
      pageConfig.use_residential.includes(slug) ? {
        model: Residential,
        as: 'residential',
        include: [{
          model: ResidentialI18n,
          as: 'i18n',
        }],
      } : null,
    ].filter(function (el) {
      return el != null;
    })
  })
    .then((data) => {
      if (data == null) {
        res.status(404).send({
          message: "Error retrieving Page " + slug,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Page " + slug,
      });
    });
};

// Update a Page by the slug in the request
exports.update = async (req, res) => {
  const slug = req.params.slug;

  const { i18n, ...page } = req.body;
  if (req.body.hasOwnProperty("nama_file")) {
    if (req.body.nama_file) {
      var file_name = req.body.nama_file.nama;
      const b = Buffer.from(req.body.nama_file.data, "base64");
      const timestamp = `page/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      page["nama_file"] = `${timestamp}/${file_name}`;
    } else {
      delete page.nama_file;
    }
  }
  if (req.body.hasOwnProperty("nama_file2")) {
    if (req.body.nama_file2) {
      var file_name = req.body.nama_file2.nama;
      const b = Buffer.from(req.body.nama_file2.data, "base64");
      const timestamp = `page/${new Date().getTime()}`;
      var dir = `public/uploads/${timestamp}/`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(dir + file_name, b, function (err) {
        if (!err) {
          console.log("file is created", file_name);
        }
      });
      page["nama_file2"] = `${timestamp}/${file_name}`;
    } else {
      delete page.nama_file2;
    }
  }
  Page.findOrCreate({
    where: { slug: slug },
    defaults: page
  })
    .then(async (result) => {
      const [data, created] = result;
      console.log(data, created);

      if (i18n instanceof Array && i18n.length > 0) {
        for (var i = 0; i < i18n.length; i++) {
          const { lang, ...trans } = i18n[i];
          const [obj, created] = await PageI18n.findOrCreate({
            where: { pageSlug: slug, lang: lang },
            defaults: trans
          });
          if (!created) {
            obj.update(trans);
          }
        }
      }
      if (!created) {
        if (page.nama_file != null && data.nama_file != null) {
          console.log("data.nama_file", data.nama_file);
          var dir = data.nama_file.split("/");
          console.log("dir", dir);
          var path = `public/uploads/${dir[0]}/${dir[1]}`;
          fs.rm(path, { recursive: true }, (err) => {
            if (err) {
              console.log("err : ", err);
            }
          });
        }
      }

      data.update(page).then(async (result) => {
        await result.reload({ include: 'i18n' });
        res.send({
          message: "Page was updated successfully.",
          data: result,
        });
        console.log("err : ", data);
      });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: `Error updating Page ${slug}`,
      });
    });
};
