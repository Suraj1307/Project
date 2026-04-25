module.exports = function redirectWithFlash(req, res, type, message, url) {
  req.flash(type, message);
  req.session.save(() => {
    res.redirect(url);
  });
};
