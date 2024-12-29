const db = require("../utils/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const addKAM = async (req, res) => {
  const id = uuidv4();
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Please fill in all required fields");
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users SET ?";
  const newKAM = { id, username, password: hashedPassword };

  const result = await db.query(sql, newKAM);
  if (result.error) {
    console.log("Error adding a new KAM:", result.error);
    res.status(500).send("Failed to add a new KAM");
    return;
  }
  res.status(201).send({ id, ...newKAM });
};
const loginKAM = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Please fill in all required fields");
    return;
  }
  const sql = "SELECT * FROM users WHERE username=?";
  const result = await db.query(sql, username);
  if (result.error) {
    console.log("Error logging in:", result.error);
    res.status(500).send("Failed to log in");
    return;
  }
  if (result.length === 0) {
    res.status(404).send("User not found");
    return;
  }
  const user = result[0];
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    res.status(401).send("Invalid password");
    return;
  }
  res.status(200).send({
    id: user.id,
    username: user.username,
    token: generateToken(user.id,user.username),
  });
};
module.exports = { addKAM, loginKAM };
