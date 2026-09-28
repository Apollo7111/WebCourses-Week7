import { useNavigate } from "react-router-dom";
import useField from "../hooks/useField";

const AddBookPage = () => {
  const title = useField("text");
  const author = useField("text");
  const isbn = useField("text");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user ? user.token : null;

  const navigate = useNavigate();

  const addBook = async (newBook) => {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBook),
      });
      if (!res.ok) {
        throw new Error("Failed to add book");
      }
      return true;
    } catch (error) {
      console.error("Error adding book:", error);
      return false;
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const newBook = {
      title: title.value,
      author: author.value,
      isbn: isbn.value,
    };

    const success = await addBook(newBook);
    if (success) {
      console.log("Book Added Successfully");
      navigate("/");
    } else {
      console.error("Failed to add the book");
    }
  };

  return (
    <div className="create">
      <h2>Add a New Book</h2>
      <form onSubmit={submitForm}>
        <label>Book Title:</label>
        <input {...title} required />
        <label>Author:</label>
        <input {...author} required />
        <label>ISBN:</label>
        <input {...isbn} required />
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default AddBookPage;