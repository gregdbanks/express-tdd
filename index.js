const express = require("express");
const dotenv = require("dotenv")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./config/db");
const errorHandler = require("./middleware/error");
require('dotenv').config();

dotenv.config({ path: "./config/config.env" });

connectDb();

const app = express();

app.use(bodyParser.json());

app.use("/api", require("./routes/missionRoutes"));
app.use("/api", require("./routes/incidentRoutes"));
app.use("/api", require("./routes/reportRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/userRoutes"));

app.use((req, res, next) => {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

app.use(cookieParser());

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;