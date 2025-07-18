const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const amzRoute = require("./routes/amzRoute");
const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
// const errorHandler = require("./middleWare/errorMiddleware");
const mongoose = require("mongoose");
import { Request, Response } from "express-serve-static-core";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:4000",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static(path.join(__dirname, "/client/dist")));

  app.use((req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
  });
} else {
  app.get("/", (req: Request, res: Response) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Middleware
// app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
interface MongooseConnectionOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
  [key: string]: unknown;
}

mongoose
  .connect(process.env.MONGO_URI as string, {} as MongooseConnectionOptions)
  .then((): void => {
    app.listen(PORT, (): void => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err: unknown): void => console.log(err));
