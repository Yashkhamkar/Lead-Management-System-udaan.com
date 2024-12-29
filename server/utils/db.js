const mysql = require("mysql");

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10, // Adjust the connection limit as needed
});

// Function to handle queries with error handling
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) {
        console.error("Database query failed:", err.message);
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Handle unexpected disconnections
pool.on("connection", (connection) => {
  console.log("New connection established.");

  connection.on("error", (err) => {
    console.error("Database connection error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    } else {
      throw err;
    }
  });

  connection.on("end", () => {
    console.error("Database connection ended unexpectedly.");
  });
});

module.exports = {
  query,
  pool,
};
