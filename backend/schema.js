const Joi = require("joi");
const { listingAmenities, listingCategories } = require("./utils/listingMetadata");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().min(10).max(1000).required(),
    location: Joi.string().trim().min(2).max(100).required(),
    country: Joi.string().trim().min(2).max(100).required(),
    price: Joi.number().required().min(0),
    category: Joi.string().valid(...listingCategories).required(),
    maxGuests: Joi.number().integer().min(1).max(20).required(),
    amenities: Joi.alternatives().try(
      Joi.array().items(Joi.string().valid(...listingAmenities)),
      Joi.string().valid(...listingAmenities)
    ).optional(),
    image: Joi.string().allow("", null),
  }).required().unknown(false),
}).unknown(false);

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().trim().min(5).max(500).required(),
  }).required().unknown(false),
}).unknown(false);

module.exports.userSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required(),
}).unknown(false);

module.exports.loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
}).unknown(false);
