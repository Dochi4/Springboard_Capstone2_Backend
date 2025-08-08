"use strict";

const axios = require("axios");
const { BadRequestError } = require("../expressError");

const booksApiKey = process.env.GOOGLE_BOOKS_API_KEY;
const booksApiURL =
  process.env.GOOGLE_BOOKS_API_URL ||
  "https://www.googleapis.com/books/v1/volumes";
const DEFAULT_IMAGE =
  "https://as1.ftcdn.net/v2/jpg/03/77/19/40/1000_F_377194073_LHGUkaGPCzOdRcuBQ40XBtrnpfJLa6hm.jpg";

class Search {
  static async books_title({ query, maxResults }) {
    // Search Google Books API using a query Title and return books.
    try {
      const params = {
        q: query,
        maxResults: maxResults,
        key: booksApiKey,
      };

      const response = await axios.get(booksApiURL, { params });
      const data = response.data;
      const books = [];

      for (let item of data.items || []) {
        const volume_info = item.volumeInfo || {};
        const access_info = item.accessInfo || {};

        books.push({
          volume_id: item.id,
          title: volume_info.title || "Untitled",
          authors: volume_info.authors || ["Unknown Author"],
          thumbnails: volume_info.imageLinks?.thumbnail || DEFAULT_IMAGE,
          categories: volume_info.categories || ["Uncategorized"],
          preview_link: volume_info.previewLink || "",
          viewability: access_info.viewability || "Unknown",
          published_date: volume_info.publishedDate || "Unknown",
          description: volume_info.description || "No Description",
        });
      }

      return books;
    } catch (err) {
      console.error("Error Called Google Books API", err);
      throw new BadRequestError("Failed to fetch books from Google API.");
    }
  }

  static async get_volume_id(volume_id) {
    // Search Google Books API using the books Volume ID and return book details.
    try {
      // console.log("Google Books API Key:", booksApiKey ? "Loaded" : "MISSING!");

      const params = {
        key: booksApiKey,
      };

      const url = `${booksApiURL}/${volume_id}`;
      // console.log("Fetching book with URL:", url, "Params:", params);
      const response = await axios.get(url, { params });

      const data = response.data;

      // Handle case where Google Books returns 404
      if (data.error) {
        throw new NotFoundError(`Book not found: ${data.error.message}`);
      }

      const volume_info = data.volumeInfo || {};

      return {
        volume_id: data.id,
        title: volume_info.title || "Untitled",
        authors: volume_info.authors || ["Unknown Author"],
        thumbnails: volume_info.imageLinks?.thumbnail || DEFAULT_IMAGE,
        categories: volume_info.categories || ["Uncategorized"],
        published_date: volume_info.publishedDate || "Unknown",
        description: volume_info.description || "No Description",
        page_count: volume_info.pageCount || "N/A",
        language: volume_info.language || "Unknown",
      };
    } catch (err) {
      // Handle Axios errors specifically
      if (err.response?.status === 404) {
        throw new NotFoundError("Book not found");
      }
      console.error("Error fetching book by volume ID:", err);
      throw new BadRequestError("Failed to fetch book");
    }
  }
}
module.exports = Search;
