import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    author: "",
    genresText: "", // comma separated
    synopsis: "",
    coverUrl: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      title: form.title,
      author: form.author,
      genres: form.genresText
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      synopsis: form.synopsis,
      coverUrl: form.coverUrl
    };

    try {
      await api.post("/books", payload);
      setMessage("✅ Book added successfully!");
      setTimeout(() => navigate("/books"), 800);
    } catch (err) {
      console.error("Error adding book:", err);
      setMessage(err.response?.data?.message || "❌ Failed to add book.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Add a New Book</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}
      >
        <input name="title" placeholder="Book Title" value={form.title} onChange={handleChange} required />
        <input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
        <input
          name="genresText"
          placeholder="Genres (comma separated) e.g. Fantasy, Sci-Fi"
          value={form.genresText}
          onChange={handleChange}
        />
        <input name="coverUrl" placeholder="Cover URL (optional)" value={form.coverUrl} onChange={handleChange} />
        <textarea
          name="synopsis"
          placeholder="Synopsis"
          value={form.synopsis}
          onChange={handleChange}
          rows="4"
          required
        />
        <button type="submit" style={{ padding: "10px", background: "green", color: "white", border: "none" }}>
          Add Book
        </button>
      </form>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}
