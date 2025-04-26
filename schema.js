const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    image: Joi.string().required(),
    code: Joi.number().required(),
    name: Joi.string().trim().required(),
    exam: Joi.string().required(),
    location: Joi.string().required(),
    type: Joi.string().required(),
    cutoff: Joi.number().required(),
    accreditation: Joi.string().required(),
    fees: Joi.number().required().min(0),
    description: Joi.string().required(),
    rating: Joi.number().required().min(0),
    establishedYear: Joi.number().max(9999).required(),
    affiliation: Joi.string().required(),
    placementRate: Joi.number().required(),
    phoneNumber: Joi.number().required(),
    email: Joi.string().email().required(),
    website: Joi.string().uri().required(),
    // No need to validate 'reviews' here because it's handled in MongoDB by reference
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.string().required(),
    comment: Joi.string().required()  
  }).required()
})
