const express = require("express");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookControllers");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

// Public routes (no authentication needed)
router.get("/", getAllBooks);
router.get("/:bookId", getBookById);

// All routes below this line require authentication
router.use(requireAuth);

// Protected routes
router.post("/", createBook);
router.put("/:bookId", updateBook);
router.delete("/:bookId", deleteBook);

module.exports = router;

