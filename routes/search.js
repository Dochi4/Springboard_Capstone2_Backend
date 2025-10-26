/** Routes for Google API search. */

const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const Search = require("../models/search");

const router = new express.Router();

// Google Books API Search
// GET /search?query=harry+potter
router.get("/", async function (req, res, next) {
  try {
    const { query, maxResults = 10 } = req.query;

    if (!query) throw new BadRequestError("Missing query parameter");

    const books = await Search.books_title({ query, maxResults });

    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

router.get("/:volume_id", async function (req, res, next) {
  try {
    const volume_id = req.params.volume_id;
    if (!volume_id) throw new NotFoundError("Missing Book Volume ID");
    const book = await Search.get_volume_id(volume_id);
    console.log("BookBackend", book);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
