const crypto = require("crypto");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const {
  listingSchema,
  reviewSchema,
  userSchema,
  loginSchema,
} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

function stripCsrfToken(body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const { _csrf, ...rest } = body;
  return rest;
}

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to continue.");
    return res.redirect("/login");
  }

  next();
};

module.exports.validateObjectId = (paramName, resourceLabel = "Resource") => (req, res, next) => {
  const value = req.params[paramName];

  if (!mongoose.isValidObjectId(value)) {
    throw new ExpressError(404, `${resourceLabel} not found.`);
  }

  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }

  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }

  if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.validateListing = (req, res, next) => {
  if (!req.body || !req.body.listing) {
    throw new ExpressError(400, "Invalid request: 'listing' data is required.");
  }

  const sanitizedBody = stripCsrfToken(req.body);
  const { error, value } = listingSchema.validate(sanitizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }

  req.body = { ...req.body, ...value };
  next();
};

module.exports.validateReview = (req, res, next) => {
  const sanitizedBody = stripCsrfToken(req.body);
  const { error, value } = reviewSchema.validate(sanitizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }

  req.body = { ...req.body, ...value };
  next();
};

module.exports.validateSignup = (req, res, next) => {
  const sanitizedBody = stripCsrfToken(req.body);
  const { error, value } = userSchema.validate(sanitizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }

  req.body = { ...req.body, ...value };
  next();
};

module.exports.validateLogin = (req, res, next) => {
  const sanitizedBody = stripCsrfToken(req.body);
  const { error, value } = loginSchema.validate(sanitizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }

  req.body = { ...req.body, ...value };
  next();
};

module.exports.requireListingImage = (req, res, next) => {
  if (!req.file) {
    throw new ExpressError(400, "A listing image is required.");
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ExpressError(404, "Review not found.");
  }

  if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.attachCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  next();
};

module.exports.enforceCsrfProtection = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  if (req.is("multipart/form-data")) {
    return next();
  }

  if (req.body && req.body._csrf === req.session.csrfToken) {
    return next();
  }

  return next(new ExpressError(403, "Invalid CSRF token."));
};

module.exports.validateCsrfToken = (req, res, next) => {
  if (req.body && req.body._csrf === req.session.csrfToken) {
    return next();
  }

  return next(new ExpressError(403, "Invalid CSRF token."));
};

module.exports.securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
};

module.exports.authRateLimiter = (() => {
  const attempts = new Map();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 20;
  let requestCount = 0;

  function sweepExpiredEntries(now) {
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetAt) {
        attempts.delete(key);
      }
    }
  }

  return (req, res, next) => {
    if (req.method !== "POST" || !["/login", "/signup"].includes(req.path)) {
      return next();
    }

    const key = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    requestCount += 1;

    if (requestCount % 50 === 0) {
      sweepExpiredEntries(now);
    }

    const current = attempts.get(key);

    if (!current || now > current.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxAttempts) {
      req.flash("error", "Too many attempts. Please try again later.");
      return res.status(429).redirect(req.path);
    }

    current.count += 1;
    return next();
  };
})();
