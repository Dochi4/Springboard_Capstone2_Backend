"use strict";

/** Express app for Newbook . */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const geminiRoutes = require("./routes/geminisearch");
const searchsRoutes = require("./routes/search");
const saveBooksRoutes = require("./routes/savebooks");
const path = require("path");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/recommendation", geminiRoutes);
app.use("/search", searchsRoutes);
app.use("/savebooks", saveBooksRoutes);

// Serve React static files:
app.use(express.static(path.join(__dirname, "public")));



/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
