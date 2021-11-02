//@ts-check
require("dotenv").config();

const db = require("./app/models");
const Travoy = db.travoy;
var axios = require('axios');
const url = `${process.env.TRAVOY_URL}${process.env.TRAVOY_TARIF_TOLL}/?key=${process.env.TRAVOY_KEY}`;
console.log('url', url);
var config = {
    method: 'post',
    url: url,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

axios(config)
    .then(async function (response) {
        const { data } = response;
        let index = 0;
        while (index < data.length) {
            const { id, ...object } = data[index];
            const [obj, created] = await Travoy.findOrCreate({
                where: { id: id },
                defaults: object
            });
            if (!created) {
                obj.update(object);
            }
            index += 1;
        }
    })
    .catch(function (error) {
        console.log(error);
    });
