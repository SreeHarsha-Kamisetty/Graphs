const express = require("express");
const { connection } = require("./db");
const cors = require("cors");
const { InvoiceRouter } = require("./routes/index");
require("dotenv").config();
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json()); // parse req.body
app.use("/invoice", InvoiceRouter); // Routes

app.get("/", (req, res) => {
  res.send("Home");
});

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to DB");
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
