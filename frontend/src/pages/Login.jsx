import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      setMessage("Login successful! Token saved ✅");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "inline-block" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
