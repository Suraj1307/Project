const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer=require("multer");
const{storage}=require("../cloudConfig.js");
const upload = multer({storage});

// NEW Route (must come before :id)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Index & Create
router.route("/")
  .get(wrapAsync(listingController.index))   // Index Route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );
  

// Edit form (must come before :id)
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Show, Update, Delete
router.route("/:id")
  .get(wrapAsync(listingController.showListings))   // Show
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

module.exports = router;
