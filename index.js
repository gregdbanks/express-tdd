const express = require("express");
const dotenv = require("dotenv")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./config/db");
const errorHandler = require("./middleware/error");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

require('dotenv').config();

dotenv.config({ path: "./config/config.env" });

connectDb();

const app = express();

app.use(bodyParser.json());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

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