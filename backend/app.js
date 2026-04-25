const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const override = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { listingAmenities, listingCategories } = require("./utils/listingMetadata");
const {
  attachCsrfToken,
  enforceCsrfProtection,
  authRateLimiter,
  securityHeaders,
} = require("./middleware.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET;

if (!dbUrl) {
  throw new Error("ATLASDB_URL is missing");
}

if (!sessionSecret) {
  throw new Error("SECRET is missing");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));
app.engine("ejs", ejsMate);
app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(override("_method"));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));
app.use(securityHeaders);

async function connectDB() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
  ttl: 7 * 24 * 60 * 60,
});

store.on("error", (err) => {
  console.error("Session Store Error:", err);
});

const sessionOptions = {
  store,
  name: "stayspot.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === "production",
  unset: "destroy",
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(attachCsrfToken);

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.csrfToken = req.session.csrfToken;
  res.locals.wishlistIds = req.user?.wishlist?.map((id) => String(id)) || [];
  res.locals.listingCategories = listingCategories;
  res.locals.listingAmenities = listingAmenities;
  next();
});

app.use(enforceCsrfProtection);

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", authRateLimiter, userRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/privacy", (req, res) => {
  res.render("static/privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("static/terms.ejs");
});

app.use((req, res) => {
  res
    .status(404)
    .render("error.ejs", {
      err: { status: 404, message: "Page not found" },
      currUser: res.locals.currUser || null,
      csrfToken: res.locals.csrfToken || "",
      success: res.locals.success || [],
      error: res.locals.error || [],
    });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  let status = err.status || 500;
  let message = err.message || "Something went wrong!";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    status = 404;
    message = "Requested resource was not found.";
  } else if (err.name === "MulterError") {
    status = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image upload failed: file size must be 5MB or less.";
    } else {
      message = "Image upload failed. Please try again with a valid file.";
    }
  } else if (err.code === 11000) {
    status = 409;
    message = "An account with that email already exists.";
  }

  res.status(status).render("error.ejs", {
    err: { status, message },
    currUser: res.locals.currUser || null,
    csrfToken: res.locals.csrfToken || "",
    success: res.locals.success || [],
    error: res.locals.error || [],
  });
});

const port = process.env.PORT || 8080;

async function startServer() {
  await connectDB();
  console.log("Connected to MongoDB");
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Startup Error:", err);
    process.exit(1);
  });
}

module.exports = { app, connectDB, startServer };
