"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var path = require("path");
var amzRoute = require("./routes/amzRoute");
var userRoute = require("./routes/userRoute");
var messageRoute = require("./routes/messageRoute");
// const errorHandler = require("./middleWare/errorMiddleware");
var mongoose = require("mongoose");
var app = express();
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
    origin: function (origin, callback) {
        var allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:8080",
            "http://localhost:4000",
            "https://myvina.onrender.com",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Routes
app.use("/api/amz", amzRoute);
app.use("/api/users", userRoute);
app.use("/api/messages", messageRoute);
// --------------------------deployment on heroku------------------------------
if (process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "staging") {
    app.use(express.static(path.join(__dirname, "/client/dist")));
    app.use(function (req, res) {
        res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
    });
}
else {
    app.get("/", function (req, res) {
        res.send("API is running..");
    });
}
// --------------------------deployment------------------------------
// Error Middleware
// app.use(errorHandler);
// start server
var PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI, {})
    .then(function () {
    app.listen(PORT, function () {
        console.log("Server Running on port ".concat(PORT));
    });
})
    .catch(function (err) { return console.log(err); });
