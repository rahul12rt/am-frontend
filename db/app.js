require("dotenv").config();
const express = require("express");
const app = express();
const { initDb } = require("./db");
const productRoutes = require("./api/watches");

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/api/watches", productRoutes);
app.get("/", (req, res) => {
  res.send("API is running!");
});

const PORT = process.env.PORT || 3001;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});
