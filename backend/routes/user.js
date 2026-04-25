const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  saveRedirectUrl,
  validateSignup,
  validateLogin,
} = require("../middleware.js");
const userController = require("../controllers/users.js");
const wrapAsync = require("../utils/wrapAsync");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(validateSignup, wrapAsync(userController.signup));

router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    validateLogin,
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.post("/logout", userController.logout);

module.exports = router;
