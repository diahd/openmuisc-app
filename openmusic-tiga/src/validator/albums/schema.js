const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  // year: Joi.number().required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
});

module.exports = { AlbumPayloadSchema };
/* destructuring object untuk mengantisipasi pembuatan lebih dari
satu nilai Schema yang di ekspor pada berkas ini ke depannya */
