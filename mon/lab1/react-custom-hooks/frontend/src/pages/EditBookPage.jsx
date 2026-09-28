import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.token : null;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${id}`);
        const data = await res.json();
        setTitle(data.title);
        setAuthor(data.author);
        setIsbn(data.isbn);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const updateBook = async (book) => {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(book),
      });
      if (!res.ok) throw new Error("Failed to update book");
      return true;
    } catch (error) {
      console.error("Error updating book:", error);
      return false;
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const updatedBook = {
      title,
      author,
      isbn,
    };

    const success = await updateBook(updatedBook);
    if (success) {
      console.log("Book Updated Successfully");
      navigate(`/books/${id}`);
    } else {
      console.error("Failed to update the book");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="create">
      <h2>Update Book</h2>
      <form onSubmit={submitForm}>
        <label>Book Title:</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Author:</label>
        <input
          type="text"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <label>ISBN:</label>
        <input
          type="text"
          required
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <button>Update Book</button>
      </form>
    </div>
  );
};

export default EditBookPage;

