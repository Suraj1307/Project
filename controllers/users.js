const User=require("../models/user");
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        
        req.flash("error", "Login failed after signup. Please log in manually.");
        return res.redirect("/login");  
      }

      req.flash("success", "Welcome to Wanderlust!");
      return res.redirect("/listings"); 
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");      
  }
};



module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to StaySpot!");
  console.log("Flash after login (session):", req.session.flash);

  const redirectUrl = res.locals.redirectUrl || "/listings";

  req.session.save(() => {
    res.redirect(redirectUrl);
  });
};




module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    console.log("Flash after logout (session):", req.session.flash);

    req.session.save(() => {
      res.redirect("/listings");
    });
  });
};
