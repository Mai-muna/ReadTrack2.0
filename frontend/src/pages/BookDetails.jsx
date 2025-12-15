import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../AuthContext";

export default function BookDetails() {
  const { id } = useParams(); // book ID from URL
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const { user } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data);
        const rev = await api.get(`/reviews/book/${id}`);
        setReviews(rev.data);
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    await api.post("/reviews", { ...form, book: id });
    const rev = await api.get(`/reviews/book/${id}`);
    setReviews(rev.data);
  };

  const likeReview = async (reviewId) => {
    await api.post(`/social/reviews/${reviewId}/like`);
    const rev = await api.get(`/reviews/book/${id}`);
    setReviews(rev.data);
  };

  const commentReview = async (reviewId) => {
    const text = prompt("Comment");
    if (!text) return;
    await api.post(`/social/reviews/${reviewId}/comment`, { text });
    const rev = await api.get(`/reviews/book/${id}`);
    setReviews(rev.data);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading book...</p>;
  if (!book) return <p style={{ textAlign: "center" }}>Book not found.</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
      <h2>📘 {book.title}</h2>
      <h4>by {book.author}</h4>

      <p><strong>Genres:</strong> {(book.genres || []).join(', ')}</p>
      <p style={{ marginTop: 20 }}>{book.synopsis}</p>

      <div style={{ marginTop: 20 }}>
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

      {user && (
        <form onSubmit={submitReview} style={{ marginTop: 20 }}>
          <h4>Leave a review</h4>
          <input
            type="number"
            min="1"
            max="5"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          />
          <textarea
            placeholder="Comment"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
      )}

      <h3>Reviews</h3>
      <ul>
        {reviews.map((r) => (
          <li key={r._id}>
            {r.user?.name}: {r.comment} ({r.rating}/5)
            <button onClick={() => likeReview(r._id)} style={{ marginLeft: 6 }}>Like ({r.likes?.length || 0})</button>
            <button onClick={() => commentReview(r._id)} style={{ marginLeft: 6 }}>Comment</button>
            <ul>
              {(r.comments || []).map((c, idx) => (
                <li key={idx}>{c.text}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
