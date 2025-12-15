import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BookList from "./pages/BookList"; // ✅ added BookList page

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#222", color: "white" }}>
        <Link to="/" style={{ margin: "0 10px", color: "white" }}>Home</Link>
        <Link to="/register" style={{ margin: "0 10px", color: "white" }}>Register</Link>
        <Link to="/login" style={{ margin: "0 10px", color: "white" }}>Login</Link>
        <Link to="/books" style={{ margin: "0 10px", color: "white" }}>Books</Link> {/* ✅ added */}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<BookList />} /> {/* ✅ added */}
      </Routes>
    </Router>
  );
}

export default App;



