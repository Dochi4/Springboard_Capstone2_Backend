
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL CHECK (position('@' IN email) > 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users_books (
    user_id INTEGER NOT NULL,
    volume_id TEXT NOT NULL,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    thumbnail TEXT,
    published_date TEXT,
    book_description TEXT,
    PRIMARY KEY (user_id, volume_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
