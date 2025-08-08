"use strict";

/** Routes for Saveing Books. */

const jsonschema = require("jsonschema");
const db = require("../db");

const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const SaveBook = require("../models/savebook");
const saveBNewSchema = require("../schemas/newSaveBooks.json");
const saveBSearchSchema = require("../schemas/searchSaveBooks.json");

const router = new express.Router();

/** POST /:username
 * Save a new book for a user
 * Request body: { volumeId, title, authors, thumbnail, published_date, description }
 * Returns: { savedBook }
 */
router.post("/:username", async function (req, res, next) {
  try {
    console.log(req.body);
    const validator = jsonschema.validate(req.body, saveBNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const username = req.params.username;
    const bookData = req.body;

    const savedBook = await SaveBook.create(username, bookData);
    return res.status(201).json({ savedBook });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/?title=optionalTitle
 * Get all saved books for a user, optionally filtered by title
 * Returns: { savedBooks: [ ... ] }
 */
router.get("/:username", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.query, saveBSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const username = req.params.username;
    const { title } = req.query;

    const savedBooks = await SaveBook.getByUsername(username, title);
    return res.json({ savedBooks });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /:username/:volumeId
 * Remove a saved book for a user
 * Returns: { deleted: volumeId }
 */
router.delete("/:username/:volumeId", async function (req, res, next) {
  try {
    const { username, volumeId } = req.params;

    // Get userId from username
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    if (!userRes.rows[0])
      throw new BadRequestError(`User ${username} not found`);

    await SaveBook.remove(userRes.rows[0].id, volumeId);
    return res.json({ deleted: volumeId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
