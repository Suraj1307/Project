const Review = require("../models/review");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const redirectWithFlash = require("../utils/redirectWithFlash");
const updateListingRating = require("../utils/updateListingRating");

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  await updateListingRating(listing._id);
  redirectWithFlash(req, res, "success", "New Review Created!", `/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  const deletedReview = await Review.findByIdAndDelete(reviewId);

  if (!listing || !deletedReview) {
    throw new ExpressError(404, "Review not found.");
  }

  await updateListingRating(id);
  redirectWithFlash(req, res, "success", "Review Deleted!", `/listings/${id}`);
};
