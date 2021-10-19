const paginate = require("express-paginate");
const fs = require("fs");
const db = require("../../models");
const Kontak = db.kontak;
const Op = db.Sequelize.Op;

const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { timeStamp } = require("console");

exports.validate = (method) => {
  switch (method) {
    case "createKontak": {
      return [
        body("nama").exists(),
        body("email").isEmail().exists(),
        body("judul").exists(),
        body("pesan").exists(),
      ];
    }
  }
};
// Create and Save a new Kontak
exports.create = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Create a Kontak
  const kontak = {
    nama: req.body.nama,
    email: req.body.email,
    judul: req.body.judul,
    pesan: req.body.pesan,
  };

  // Save Kontak in the database
  Kontak.create(kontak)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Kontak.",
      });
    });
};
