import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    genresText: "",
    synopsis: "",
    coverUrl: ""
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setForm({
          title: res.data.title || "",
          author: res.data.author || "",
          genresText: (res.data.genres || []).join(", "),
          synopsis: res.data.synopsis || "",
          coverUrl: res.data.coverUrl || ""
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      title: form.title,
      author: form.author,
      genres: form.genresText.split(",").map((g) => g.trim()).filter(Boolean),
      synopsis: form.synopsis,
      coverUrl: form.coverUrl
    };

    try {
      await api.put(`/books/${id}`, payload);
      setMessage("✅ Book updated!");
      setTimeout(() => navigate("/books"), 800);
    } catch (err) {
      console.error("Error updating book:", err);
      setMessage(err.response?.data?.message || "❌ Failed to update the book.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading book...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Edit Book</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: 20 }}>
        <input name="title" placeholder="Book Title" value={form.title} onChange={handleChange} required />
        <input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
        <input
          name="genresText"
          placeholder="Genres (comma separated)"
          value={form.genresText}
          onChange={handleChange}
        />
        <input name="coverUrl" placeholder="Cover URL (optional)" value={form.coverUrl} onChange={handleChange} />
        <textarea name="synopsis" placeholder="Synopsis" value={form.synopsis} onChange={handleChange} rows="4" required />
        <button type="submit" style={{ padding: "10px", background: "blue", color: "white", border: "none" }}>
          Update Book
        </button>
      </form>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}
