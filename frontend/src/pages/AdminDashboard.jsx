import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const { token } = useAuth();

  const load = async () => {
    try {
      const res = await api.get("/auth/admin/users");
      setUsers(res.data);
      const reportsRes = await api.get("/admin/reports");
      setReports(reportsRes.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const banToggle = async (userId, action) => {
    await api.post(`/admin/${action}/${userId}`);
    load();
  };

  const resolveReport = async (reportId) => {
    await api.post(`/admin/reports/${reportId}/resolve`);
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Moderation</h2>
      <h3>Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} ({u.email}) {u.isBanned ? "🚫" : "✅"}
            <button onClick={() => banToggle(u._id, u.isBanned ? "unban" : "ban")} style={{ marginLeft: 8 }}>
              {u.isBanned ? "Unban" : "Ban"}
            </button>
          </li>
        ))}
      </ul>

      <h3>Reports</h3>
      <ul>
        {reports.map((r) => (
          <li key={r._id}>
            {r.reason} - status: {r.status}
            {r.status !== "resolved" && (
              <button onClick={() => resolveReport(r._id)} style={{ marginLeft: 8 }}>
                Resolve
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
