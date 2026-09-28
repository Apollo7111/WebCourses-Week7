import { Link } from "react-router-dom";

const BookListings = ({ books }) => {
  return (
    <div className="book-list">
      {books.map((book) => (
        <div className="book-preview" key={book.id}>
          <Link to={`/books/${book.id}`}>
            <h2>{book.title}</h2>
          </Link>
          <p>Author: {book.author}</p>
          <p>ISBN: {book.isbn}</p>
        </div>
      ))}
    </div>
  );
};

export default BookListings;

