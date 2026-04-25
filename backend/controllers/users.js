const User = require("../models/user");
const redirectWithFlash = require("../utils/redirectWithFlash");

function establishSession(req, res, user, redirectUrl, successMessage, next) {
  req.session.regenerate((sessionError) => {
    if (sessionError) {
      return next(sessionError);
    }

    req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      req.flash("success", successMessage);
      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        res.redirect(redirectUrl);
      });
    });
  });
}

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    establishSession(req, res, registeredUser, "/listings", "Welcome to StaySpot!", next);
  } catch (err) {
    return redirectWithFlash(req, res, "error", err.message, "/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res, next) => {
  const redirectUrl = res.locals.redirectUrl || "/listings";
  const authenticatedUser = req.user;

  establishSession(req, res, authenticatedUser, redirectUrl, "Welcome back to StaySpot!", next);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);

      res.clearCookie("stayspot.sid");
      req.flash("success", "Logged out successfully.");
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.redirect("/listings");
      });
    });
  });
};
