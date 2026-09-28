const mongoose = require("mongoose");
const Book = require("../models/bookModel");

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Create a new book
const createBook = async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  const { bookId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(404).json({ error: "No such book" });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Update book by ID
const updateBook = async (req, res) => {
  const { bookId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(404).json({ error: "No such book" });
  }

  try {
    const book = await Book.findOneAndUpdate(
      { _id: bookId },
      { ...req.body },
      { returnDocument: 'after' } 
    );
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete book by ID
const deleteBook = async (req, res) => {
  const { bookId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(404).json({ error: "No such book" });
  }

  try {
    const book = await Book.findOneAndDelete({ _id: bookId });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook,
};

