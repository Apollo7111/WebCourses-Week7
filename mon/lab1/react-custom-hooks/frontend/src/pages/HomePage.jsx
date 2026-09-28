import BookListings from "../components/BookListings";
import useFetch from "../hooks/useFetch";

const Home = () => {
  const { data: books, loading, error } = useFetch("/api/books");

  return (
    <div className="home">
      {error && <div>{error}</div>}
      {loading && <div>Loading...</div>}
      {books && <BookListings books={books} />}
    </div>
  );
};

export default Home;