const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports = async function updateListingRating(listingId) {
  const stats = await Review.aggregate([
    {
      $match: {
        _id: {
          $in: (await Listing.findById(listingId).select("reviews").lean())?.reviews || [],
        },
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const ratingStats = stats[0] || { averageRating: 0, ratingCount: 0 };

  await Listing.findByIdAndUpdate(listingId, {
    averageRating: ratingStats.averageRating || 0,
    ratingCount: ratingStats.ratingCount || 0,
  });
};
