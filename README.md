# New Book AI Backend

**URL:** https://newbookai.onrender.com/

## Description

This is the backend of my website, designed to help people find their next novel and easily pick books suited to their tastes.  
Users can describe their ideal book or even describe a book cover they remember, and the system provides multiple recommendations with detailed reasons for each choice.  
This solves the common problem of “what to read next” that many readers face after finishing a novel.

---

## Features

- RESTful API with endpoints for user registration, login, and profile management  
- Secure password storage using bcrypt hashing  
- Integration with Google Books API for fetching book details  
- Integration with Gemini 2.5 through OpenRouter for AI-powered book recommendations  

---

## External APIs

### Google Books API

This project uses the Google Books API to fetch book data.  
Google Books was chosen because it offers a free, extensive, and well-documented library of books worldwide.  

Initially, Goodreads API was considered since it’s a personal favorite, but it’s no longer freely available.  
WorldCat was also explored but access was restricted via local library authentication.  
Google Books fulfilled the project’s needs for a reliable and comprehensive book data source.

### Gemini Through OpenRouter

The project uses Gemini 2.5 via OpenRouter for AI-powered book recommendation fetchers.  
Gemini was chosen because it was relatively new when the app was created, providing a fresh approach compared to a previous attempt using Deepseek.  
Additionally, since both Gemini and Google Books are part of the same company, it was believed that integration between them would be more accurate.

---

## API Routes

### Authentication

- **POST /auth/token**  
  Request: `{ username, password }`  
  Response: `{ token }`  
  Returns JWT token for authenticating further requests. No authorization required.

- **POST /auth/register**  
  Request: `{ user }` (must include `{ username, password, firstName, lastName, email }`)  
  Response: `{ token }`  
  Registers a new user and returns JWT token. No authorization required.

---

### Book Recommendations

- **POST /recommendation/ask**  
  Used for testing Gemini API calls and responses.

- **POST /recommendation/userDescription**  
  Accepts a user’s text description of their ideal book and returns 15 book recommendations from Google Books along with reasons for each match.

- **POST /recommendation/userCover**  
  Accepts a description of a book cover’s visual elements and returns 15 matching book recommendations with reasons.

- **POST /recommendation/simBooks**  
  Returns 15 books similar to a given book’s title and description, with reasons for each recommendation.

---

### User Books Management

- **POST /:username**  
  Save a new book for a user.  
  Request body: `{ volumeId, title, authors, thumbnail, published_date, description }`  
  Response: `{ savedBook }`

- **GET /:username/?title=optionalTitle**  
  Get all saved books for a user, optionally filtered by title.  
  Response: `{ savedBooks: [ ... ] }`

- **DELETE /:username/:volumeId**  
  Remove a saved book for a user.  
  Response: `{ deleted: volumeId }`

---

### Google Books API Proxy

- **GET /search?query=harry+potter**  
  Search Google Books with a query, returns up to 20 matching books.

- **GET /search/:volume_id**  
  Get detailed book info from Google Books by volume ID.

---

### User Routes

- **POST /**  
  Add a new user . Request body includes user data; returns created user and auth token.

- **GET /[username]**  
  Get user details (same user only).

- **PATCH /[username]**  
  Update user details (same user only).

---

## Technology Stack

- PostgreSQL (PSQL)  
- Node.js  
- JavaScript  
- CSS, HTML  
- React (frontend)  

---

## Getting Started

To run the backend locally on your machine, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/Dochi4/Springboard_Capstone2_Backend.git
   cd Springboard_Capstone2_Backend

2. **Install dependencies**
  - npm install

3. **Create a .env file in the project root and add necessary variables like**
   - SECRET_KEY=your_secret_key
   - DATABASE_URL=your_database_connection_string PORT=3001
   - GOOGLE_BOOKS_API_KEY=your_google_books_api_key
   - GOOGLE_BOOKS_API_URL=your_google_books_api_url

# Gemini From Gemini Studio
- OPRO_GEMINI2_KEY=your_gemini_key
- OPRO_GEMINI2_URL=your_gemini_url

4.**Start the server**
node server.js
