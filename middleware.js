// middleware/isLoggedIn.js
module.exports = function isLoggedIn(req, res, next) {
  console.log(req.user);
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "You must be logged in!");
      return res.redirect("/login");
    }
    next();
  };

module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}
  