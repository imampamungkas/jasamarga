//@ts-check
const fs = require("fs");
const db = require("../models");
const Page = db.page;
const PageI18n = db.pageI18n;
const Gallery = db.gallery;
const GalleryI18n = db.galleryI18n;

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

      }
    ]
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
        if (data.nama_file != null) {
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
      });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({
        message: `Error updating Page ${slug}`,
      });
    });
};
