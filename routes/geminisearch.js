/** Routes for Google API search. */

const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const GeminiSearch = require("../models/geminiSearch");

const router = new express.Router();

// Google Books API Search (Gemini-powered)
// POST /recommendation/ask
router.post("/ask", async function (req, res, next) {
  try {
    const { content } = req.body;
    if (!content) throw new BadRequestError("Missing content in request body");

    const response = await GeminiSearch.ask(content);
    console.log("Ask Response:", response);

    return res.json({ response });
  } catch (err) {
    return next(err);
  }
});

router.post("/userDescription", async function (req, res, next) {
  try {
    const { content } = req.body;
    if (!content) throw new BadRequestError("Missing content in request body");

    const response = await GeminiSearch.similarUserDescript(content);
    console.log("Descript Response:", response);

    return res.json({ response });
  } catch (err) {
    return next(err);
  }
});
router.post("/userCover", async function (req, res, next) {
  try {
    const { content } = req.body;
    if (!content) throw new BadRequestError("Missing content in request body");

    const response = await GeminiSearch.similarCoverDescript(content);
    console.log("Cover Response:", response);

    return res.json({ response });
  } catch (err) {
    return next(err);
  }
});

router.post("/similarBook", async function (req, res, next) {
  try {
    const { content } = req.body;
    if (!content) throw new BadRequestError("Missing content in request body");
    console.log("SimBook BackEnd Content:", content);

    const response = await GeminiSearch.similarBookDescript(content);
    console.log(" Sim Book Response:", response);

    return res.json({ response });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
