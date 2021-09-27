module.exports = translate;

function translate(results, lang) {
  return results.map(function (val, index) {
    for (const value of val._options.attributes) {
      if (value.endsWith(`_en`)) {
        if (lang == "en") {
          val.set(value.replace("_en", ""), val.get(value));
        }
        delete val.dataValues[value];
      }
    }
    return val;
  });
}
