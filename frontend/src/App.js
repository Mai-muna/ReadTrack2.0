import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BookList from "./pages/BookList";
import BookDetails from "./pages/BookDetails";
import ReadingList from "./pages/ReadingList";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import Social from "./pages/Social";
import { AuthProvider, useAuth } from "./AuthContext";

const Nav = () => {
  const { token, user, logout } = useAuth();
  return (
    <nav style={{ padding: "10px", background: "#222", color: "white" }}>
      <Link to="/" style={{ margin: "0 10px", color: "white" }}>Home</Link>
      <Link to="/books" style={{ margin: "0 10px", color: "white" }}>Books</Link>
      {token && (
        <>
          <Link to="/reading-list" style={{ margin: "0 10px", color: "white" }}>Reading List</Link>
          <Link to="/recommendations" style={{ margin: "0 10px", color: "white" }}>Recommendations</Link>
          <Link to="/social" style={{ margin: "0 10px", color: "white" }}>Social</Link>
          <Link to="/analytics" style={{ margin: "0 10px", color: "white" }}>Analytics</Link>
        </>
      )}
      {user?.role === "admin" && <Link to="/admin" style={{ margin: "0 10px", color: "white" }}>Admin</Link>}
      {!token ? (
        <>
          <Link to="/register" style={{ margin: "0 10px", color: "white" }}>Register</Link>
          <Link to="/login" style={{ margin: "0 10px", color: "white" }}>Login</Link>
        </>
      ) : (
        <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
      )}
    </nav>
  );
};

function App() {
  const ProtectedRoute = ({ element }) => {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    return element;
  };

  const AdminRoute = ({ element }) => {
    const { token, user } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== "admin") return <Navigate to="/" replace />;
    return element;
  };

  return (
    <AuthProvider>
      <Router>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/reading-list" element={<ProtectedRoute element={<ReadingList />} />} />
          <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
          <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
          <Route path="/recommendations" element={<ProtectedRoute element={<Recommendations />} />} />
          <Route path="/social" element={<ProtectedRoute element={<Social />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;



