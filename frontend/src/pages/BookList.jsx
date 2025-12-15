import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get("/books");
        setBooks(res.data);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading books...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
      <h2>📚 All Books</h2>

      {books.length === 0 ? (
        <p>No books available yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {books.map((book) => (
            <li
              key={book._id}
              style={{
                margin: "15px 0",
                padding: "10px",
                background: "#f4f4f4",
                borderRadius: "8px",
              }}
            >
              <strong>{book.title}</strong> by {book.author}

              <div style={{ marginTop: 8 }}>
                <Link
                  to={`/books/${book._id}`}
                  style={{ marginRight: 10, color: "blue" }}
                >
                  View
                </Link>

                <Link
                  to={`/books/${book._id}/edit`}
                  style={{ marginLeft: 10, color: "green" }}
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
