import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AddBook() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
  });

  const [message, setMessage] = useState("");

  // Handle input fields
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/books", form); // Backend API call
      console.log("Book added:", res.data);

      setMessage("✅ Book added successfully!");

      setTimeout(() => navigate("/books"), 1000); // Redirect after 1 sec
    } catch (err) {
      console.error("Error adding book:", err);
      setMessage("❌ Failed to add book. Check console.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Add a New Book</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "20px",
        }}
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
          placeholder="Short Description"
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
            background: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Book
        </button>
      </form>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}
