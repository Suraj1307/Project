const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const escapeRegex = require("../utils/escapeRegex");
const redirectWithFlash = require("../utils/redirectWithFlash");
const updateListingRating = require("../utils/updateListingRating");
const { listingAmenities, listingCategories } = require("../utils/listingMetadata");

function normalizeAmenities(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function buildSortOption(sort) {
  switch (sort) {
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    case "rating-desc":
      return { averageRating: -1, ratingCount: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

module.exports.index = async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const minPrice = Number.parseInt(req.query.minPrice, 10);
  const maxPrice = Number.parseInt(req.query.maxPrice, 10);
  const guests = Number.parseInt(req.query.guests, 10);
  const amenities = normalizeAmenities(req.query.amenities);
  const favoritesOnly = req.query.favorites === "1";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";
  const filters = {};
  let searchMessage = null;
  let searchMessageType = null;

  if (query) {
    if (query.length > 100) {
      throw new ExpressError(400, "Search query is too long.");
    }

    const safeQuery = escapeRegex(query);
    filters.$or = [
      { title: { $regex: safeQuery, $options: "i" } },
      { location: { $regex: safeQuery, $options: "i" } },
      { country: { $regex: safeQuery, $options: "i" } },
      { category: { $regex: safeQuery, $options: "i" } },
    ];
  }

  if (category && listingCategories.includes(category)) {
    filters.category = category;
  }

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filters.price = {};
    if (Number.isFinite(minPrice)) {
      filters.price.$gte = minPrice;
    }
    if (Number.isFinite(maxPrice)) {
      filters.price.$lte = maxPrice;
    }
  }

  if (Number.isFinite(guests) && guests > 0) {
    filters.maxGuests = { $gte: guests };
  }

  if (amenities.length) {
    filters.amenities = { $all: amenities.filter((item) => listingAmenities.includes(item)) };
  }

  if (favoritesOnly) {
    if (!res.locals.currUser) {
      req.flash("error", "Log in to view your saved stays.");
      return res.redirect("/login");
    }

    filters._id = { $in: res.locals.wishlistIds };
  }

  const allListings = await Listing.find(filters).sort(buildSortOption(sort));

  if (query || category || favoritesOnly || Number.isFinite(minPrice) || Number.isFinite(maxPrice) || Number.isFinite(guests) || amenities.length) {
    if (allListings.length === 0) {
      searchMessage = "No stays matched your current filters.";
      searchMessageType = "error";
    } else {
      searchMessage = `${allListings.length} stay${allListings.length === 1 ? "" : "s"} found.`;
      searchMessageType = "success";
    }
  }

  res.render("listings/index.ejs", {
    allListings,
    query,
    searchMessage,
    searchMessageType,
    selectedCategory: category,
    selectedAmenities: amenities,
    listingAmenities,
    listingCategories,
    filters: {
      minPrice: Number.isFinite(minPrice) ? minPrice : "",
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : "",
      guests: Number.isFinite(guests) ? guests : "",
      sort,
      favoritesOnly,
    },
  });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs", {
    listingCategories,
    listingAmenities,
  });
};

module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  const actualReviewCount = listing.reviews.length;
  const actualAverageRating = actualReviewCount
    ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / actualReviewCount
    : 0;

  if (
    listing.ratingCount !== actualReviewCount ||
    Math.abs((listing.averageRating || 0) - actualAverageRating) > 0.01
  ) {
    await updateListingRating(listing._id);
    listing.ratingCount = actualReviewCount;
    listing.averageRating = actualAverageRating;
  }

  res.render("listings/show.ejs", {
    listing,
    isWishlisted: res.locals.wishlistIds.includes(String(listing._id)),
  });
};

module.exports.createListing = async (req, res) => {
  const { path: url, filename } = req.file;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.amenities = normalizeAmenities(req.body.listing.amenities);
  newListing.image = { url, filename };
  await newListing.save();
  redirectWithFlash(req, res, "success", "New Listing Created!", "/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image?.url
    ? listing.image.url.replace("/upload", "/upload/h_300,w_250")
    : null;

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
    listingCategories,
    listingAmenities,
  });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listingPayload = {
    ...req.body.listing,
    amenities: normalizeAmenities(req.body.listing.amenities),
  };

  const listing = await Listing.findByIdAndUpdate(
    id,
    listingPayload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }

  if (typeof req.file !== "undefined") {
    const { path: url, filename } = req.file;
    listing.image = { url, filename };
    await listing.save();
  }

  redirectWithFlash(req, res, "success", "Listing Updated!", `/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found.");
  }

  redirectWithFlash(req, res, "success", "Listing Deleted!", "/listings");
};

module.exports.addToWishlist = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.exists({ _id: id });
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  await req.user.updateOne({ $addToSet: { wishlist: id } });
  redirectWithFlash(req, res, "success", "Saved to wishlist.", `/listings/${id}`);
};

module.exports.removeFromWishlist = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.exists({ _id: id });
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  await req.user.updateOne({ $pull: { wishlist: id } });
  redirectWithFlash(req, res, "success", "Removed from wishlist.", `/listings/${id}`);
};
