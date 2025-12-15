import { useEffect, useState } from "react";
import api from "../api/api";

export default function Recommendations() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api
      .get("/recommendations")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Failed to load recommendations", err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Recommended for you</h2>
      <ul>
        {books.map((b) => (
          <li key={b._id}>{b.title} by {b.author}</li>
        ))}
      </ul>
    </div>
  );
}
