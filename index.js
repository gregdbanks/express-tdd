const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// const { connectDb } = require("./config/db");

dotenv.config({ path: "./config/config.env" });
// connectDb();

const app = express();

app.use(bodyParser.json());

app.use("/api", require("./routes/missionRoutes"));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;