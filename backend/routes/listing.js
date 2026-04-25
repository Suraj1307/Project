const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  requireListingImage,
  validateCsrfToken,
  validateObjectId,
} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const ExpressError = require("../utils/ExpressError.js");
const { storage } = require("../cloudConfig.js");

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      return cb(new ExpressError(400, "Only JPG and PNG images are allowed."));
    }

    cb(null, true);
  },
});

router.get("/new", isLoggedIn, listingController.renderNewForm);
router.post(
  "/:id/wishlist",
  validateObjectId("id", "Listing"),
  isLoggedIn,
  validateCsrfToken,
  wrapAsync(listingController.addToWishlist)
);
router.delete(
  "/:id/wishlist",
  validateObjectId("id", "Listing"),
  isLoggedIn,
  validateCsrfToken,
  wrapAsync(listingController.removeFromWishlist)
);

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateCsrfToken,
    requireListingImage,
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get(
  "/:id/edit",
  validateObjectId("id", "Listing"),
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router.route("/:id")
  .all(validateObjectId("id", "Listing"))
  .get(wrapAsync(listingController.showListings))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateCsrfToken,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    validateCsrfToken,
    wrapAsync(listingController.destroyListing)
  );

module.exports = router;
