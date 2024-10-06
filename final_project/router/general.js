const express = require('express');
const axios = require('axios'); 
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Task 10: Get the list of books available in the shop using async/await
public_users.get('/books', async (req, res) => {
    try {
        // Assuming you have an endpoint that serves the book data
        const response = await axios.get('http://localhost:5000/books'); 
        res.status(200).json(response.data); // Send back the list of books
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;  // Retrieve the ISBN from request parameters

    try {
        // Find the book that matches the ISBN
        const book = Object.values(books).find(b => b.isbn === isbn);
        
        if (book) {
            return res.status(200).json(book);  // Return book details
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});

// Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author; // Retrieve the author from request parameters

    try {
        // Find books by the specified author
        const matchingBooks = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());
        
        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks); // Return matching books
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Task 13: Get all books based on title using async/await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title; // Retrieve the title from request parameters

    try {
        // Find books by the specified title
        const matchingBooks = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());
        
        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks); // Return matching books
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn; // Retrieve the ISBN from request parameters

    try {
        const book = Object.values(books).find(b => b.isbn === isbn);

        if (book) {
            return res.status(200).json(book.reviews);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book review", error: error.message });
    }
});

module.exports.general = public_users;


