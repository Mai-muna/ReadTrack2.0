import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function ReadingList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getReadingList = async () => {
      try {
        const res = await api.get("/books/reading-list");
        setBooks(res.data);
      } catch (err) {
        console.error("Error fetching reading list:", err);
      } finally {
        setLoading(false);
      }
    };

    getReadingList();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading reading list...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
      <h2>📖 My Reading List</h2>

      {books.length === 0 ? (
        <p>Your reading list is empty.</p>
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
