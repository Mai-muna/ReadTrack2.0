import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: "", author: "", genre: "", minRating: "" });
  const [top, setTop] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await api.get("/books", { params: filters });
      setBooks(res.data);
      const topRes = await api.get("/books/top/list");
      const recentRes = await api.get("/books/recent/list");
      setTop(topRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading books...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", textAlign: "center" }}>
      <h2>📚 All Books</h2>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "10px 0" }}>
        <input name="q" placeholder="Search title" value={filters.q} onChange={handleChange} />
        <input name="author" placeholder="Author" value={filters.author} onChange={handleChange} />
        <input name="genre" placeholder="Genre" value={filters.genre} onChange={handleChange} />
        <input name="minRating" placeholder="Min rating" value={filters.minRating} onChange={handleChange} />
        <button onClick={loadBooks}>Apply</button>
      </div>

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

      <h3>Top Rated</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {top.map((b) => (
          <li key={b._id}>{b.title} ({b.ratingsAverage?.toFixed?.(1) || 0})</li>
        ))}
      </ul>

      <h3>Recently Added</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {recent.map((b) => (
          <li key={b._id}>{b.title}</li>
        ))}
      </ul>
    </div>
  );
}
