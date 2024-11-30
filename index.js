const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const app = express();

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;