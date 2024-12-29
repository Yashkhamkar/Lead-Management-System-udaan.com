const jwt = require("jsonwebtoken");

const generateToken = (id,username) => {
  return jwt.sign({ id:id, username: username }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
};

module.exports = generateToken;
