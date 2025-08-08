"use strict";

const db = require("../db");
const axios = require("axios");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class SaveBook {
  /** Create a saved book for a user */
  static async create(username, bookData) {
    const { volumeId, title, authors, thumbnail, published_date, description } =
      bookData;

    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    if (!userRes.rows[0]) throw new NotFoundError(`User ${username} not found`);

    const userId = userRes.rows[0].id;

    const duplicateCheck = await db.query(
      `SELECT 1 FROM users_books WHERE user_id = $1 AND volume_id = $2`,
      [userId, volumeId]
    );
    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Book already saved for this user`);

    const results = await db.query(
      `INSERT INTO users_books
       (user_id, volume_id, title, authors, thumbnail, published_date, book_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id AS "userId",
                 volume_id AS "volumeId",
                 title,
                 authors,
                 thumbnail,
                 published_date AS "publishedDate",
                 book_description AS "description"`,
      [
        userId,
        volumeId,
        title,
        authors || [],
        thumbnail,
        published_date,
        description,
      ]
    );

    return results.rows[0];
  }

   /** Find all saved books by a Useranme, optional filter by title */
  static async getByUsername(username, title) {
    let query = `
    SELECT ub.user_id AS "userId",
           ub.volume_id AS "volumeId",
           ub.title,
           ub.authors,
           ub.thumbnail,
           ub.published_date AS "publishedDate",
           ub.book_description AS "description"
    FROM users_books AS ub
      JOIN users AS u ON ub.user_id = u.id
    WHERE u.username = $1`;

    const queryValues = [username];

    if (title) {
      query += ` AND ub.title ILIKE $2`;
      queryValues.push(`%${title}%`);
    }

    query += ` ORDER BY ub.title`;

    const result = await db.query(query, queryValues);
    return result.rows;
  }

  /** Remove a saved book by userId and volumeId */
  static async remove(userId, volumeId) {
    const result = await db.query(
      `DELETE FROM users_books
       WHERE user_id = $1 AND volume_id = $2
       RETURNING user_id`,
      [userId, volumeId]
    );

    if (!result.rows[0]) {
      throw new NotFoundError(
        `No saved book for user: ${userId} and volumeId: ${volumeId}`
      );
    }
  }
}

module.exports = SaveBook;
