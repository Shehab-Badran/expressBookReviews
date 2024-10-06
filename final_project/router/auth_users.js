const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Array to hold user data
const secretKey = "your_secret_key"; // Use an environment variable in production

const isValid = (username) => {
    return users.some(user => user.username === username); // Check if username exists
};

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password; // Check if password matches
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: "No token provided." });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        req.username = decoded.username; // Save the username from the token
        next();
    });
};

// User Login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});
// Add or modify a book review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from URL parameters
    const { review } = req.body; // Get review from request body
    const username = req.username; // Get username from the JWT token

    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Check if the book exists
    const book = Object.values(books).find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review
    book.reviews[username] = review; // This will add or modify the review based on the username
    return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from URL parameters
    const username = req.username; // Get username from the JWT token

    // Check if the book exists
    const book = Object.values(books).find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for the user
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
});

// Export the router
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
