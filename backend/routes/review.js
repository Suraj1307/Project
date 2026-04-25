const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
  validateCsrfToken,
  validateObjectId,
} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

router.use(validateObjectId("id", "Listing"));

router.post(
  "/",
  isLoggedIn,
  validateCsrfToken,
  validateReview,
  wrapAsync(reviewController.createReview)
);

router.delete(
  "/:reviewId",
  validateObjectId("reviewId", "Review"),
  isLoggedIn,
  isReviewAuthor,
  validateCsrfToken,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
