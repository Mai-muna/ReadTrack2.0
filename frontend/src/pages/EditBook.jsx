import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function EditBook() {
  const { id } = useParams(); // get book id from route
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Load existing book data
  useEffect(() => {
    const getBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setForm({
          title: res.data.title,
          author: res.data.author,
          genre: res.data.genre,
          description: res.data.description,
        });
      } catch (err) {
        console.error("Error fetching book:", err);
        setMessage("❌ Failed to load book.");
      } finally {
        setLoading(false);
      }
    };

    getBook();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.put(`/books/${id}`, form);
      setMessage("✅ Book updated successfully!");

      setTimeout(() => navigate("/books"), 1000);
    } catch (err) {
      console.error("Error updating book:", err);
      setMessage("❌ Failed to update the book.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading book...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Edit Book</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: 20 }}
      >
        <input
          type="text"
          name="title"
          placeholder="Book Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        />

        <input
          type="text"
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        />

        <input
          type="text"
          name="genre"
          placeholder="Genre"
          value={form.genre}
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          required
          style={{ padding: "10px" }}
        ></textarea>

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Update Book
        </button>
      </form>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}
