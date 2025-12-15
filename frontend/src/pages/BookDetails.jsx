import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function BookDetails() {
  const { id } = useParams(); // book ID from URL
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading book...</p>;
  if (!book) return <p style={{ textAlign: "center" }}>Book not found.</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
      <h2>📘 {book.title}</h2>
      <h4>by {book.author}</h4>

      <p><strong>Genre:</strong> {book.genre}</p>
      <p style={{ marginTop: 20 }}>{book.description}</p>

      <div style={{ marginTop: 20 }}>
        <Link
          to={`/books/${book._id}/edit`}
          style={{
            padding: "10px 20px",
            background: "green",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        >
          Edit
        </Link>

        <Link
          to="/books"
          style={{
            padding: "10px 20px",
            background: "gray",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Back
        </Link>
      </div>
    </div>
  );
}
