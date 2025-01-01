const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const db = require("./utils/db");
const leadsRoutes = require("./routes/leads.routes");
const contactsRoutes = require("./routes/contacts.routes");
const interactionsRoutes = require("./routes/interactions.routes");
const kamRoutes = require("./routes/kam.routes");
const performanceRoutes = require("./routes/performance.routes");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/leads", leadsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/auth", kamRoutes);
app.use("/api/performance", performanceRoutes);
