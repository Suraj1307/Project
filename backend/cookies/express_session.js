const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: "your secret key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

// In-memory posts
const posts = [];

// Login route
app.get("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    req.flash("error", "Username and password required");
    return res.redirect("/login");
  }

  // Save full user in session
  req.session.user = { username };
  req.flash("success", "User logged in.");
  res.redirect("/profile");
});

// Profile route
app.get("/profile", (req, res) => {
  res.locals.messages = req.flash("success"); // ✅ fix
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("page.ejs", { name: req.session.user.username });
});

// Post creation route (requires login)
app.post("/posts", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { title, content } = req.body;
  const post = {
    id: posts.length + 1,
    user: req.session.user.username,
    title,
    content,
  };
  posts.push(post);
  res.json({ message: "Post created", post });
});

// See user info and posts
app.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json({
    user: req.session.user,
    posts: posts.filter((post) => post.user === req.session.user.username),
  });
});

// Session request counter
app.get("/request", (req, res) => {
  if (!req.session.count) {
    req.session.count = 1;
  } else {
    req.session.count += 1;
  }

  res.send(`You have made ${req.session.count} requests in this session.`);
});

app.listen(3000, () => {
  console.log("Server running on 3000");
});
