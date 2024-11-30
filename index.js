const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(bodyParser.json());

app.use("/api", require("./routes/missionRoutes"));

app.use((req, res, next) => {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        error: error.message || 'Internal Server Error',
    });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;