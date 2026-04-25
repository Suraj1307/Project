const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { listingCategories, listingAmenities } = require("../utils/listingMetadata");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    category: {
      type: String,
      enum: listingCategories,
      default: "Trending",
      index: true,
    },
    maxGuests: {
      type: Number,
      min: 1,
      max: 20,
      default: 2,
    },
    amenities: [
      {
        type: String,
        enum: listingAmenities,
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

listingSchema.virtual("ratingLabel").get(function ratingLabel() {
  if (!this.ratingCount) {
    return "New";
  }

  return this.averageRating.toFixed(1);
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
