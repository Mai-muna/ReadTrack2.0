import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function ReadingList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReadingList();
  }, []);

  const getReadingList = async () => {
    try {
      const res = await api.get("/reading-list");
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching reading list:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookId, status) => {
    await api.put("/reading-list/update-status", { bookId, status });
    getReadingList();
  };

  const updateProgress = async (bookId, progress) => {
    await api.put("/reading-list/update-progress", { bookId, progress: Number(progress) });
    getReadingList();
  };

  const exportSummary = async (format) => {
    const res = await api.get(`/export/reading-summary${format === 'pdf' ? '?format=pdf' : ''}`, { responseType: format === 'pdf' ? 'blob' : 'text' });
    if (format === 'pdf') {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reading-summary.pdf';
      link.click();
    } else {
      alert(res.data);
    }
  };

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
              <strong>{book.book?.title || book.title}</strong> - status: {book.status}
              <div>
                Progress: {book.progress || 0}%
              </div>
              <div style={{ marginTop: 8 }}>
                <Link to={`/books/${book.book?._id || book._id}`} style={{ marginRight: 10, color: "blue" }}>
                  View
                </Link>
                <select value={book.status} onChange={(e) => updateStatus(book.book?._id || book._id, e.target.value)}>
                  <option value="wantToRead">Want</option>
                  <option value="currentlyReading">Currently</option>
                  <option value="finished">Finished</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={book.progress || 0}
                  onBlur={(e) => updateProgress(book.book?._id || book._id, e.target.value)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => exportSummary('text')}>Export Text</button>
        <button onClick={() => exportSummary('pdf')} style={{ marginLeft: 8 }}>Export PDF</button>
      </div>
    </div>
  );
}
