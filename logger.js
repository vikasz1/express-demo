const log = function (req, res, next) {
  console.log("logging...");
  next();
};
module.exports = log