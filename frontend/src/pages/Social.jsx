import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";

export default function Social() {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  const load = async (page = 1) => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data.filter((u) => u._id !== (user?.id || user?._id)));
      const notif = await api.get("/social/notifications", { params: { page, limit: pagination.limit } });
      setNotifications(notif.data.items);
      setPagination({ ...notif.data.pagination, limit: pagination.limit });
      setUnread(notif.data.unread);
    } catch (err) {
      console.error("Social load failed", err);
    }
  };

  useEffect(() => {
    load(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const follow = async (id, action) => {
    await api.post(`/social/${action}/${id}`);
    load();
  };

  const markRead = async (id) => {
    await api.patch(`/social/notifications/${id}/read`);
    load(pagination.page);
  };

  const markAll = async () => {
    await api.patch("/social/notifications/read-all");
    load(pagination.page);
  };

  const changePage = (delta) => {
    const next = pagination.page + delta;
    const maxPage = Math.ceil((pagination.total || 0) / pagination.limit) || 1;
    if (next < 1 || next > maxPage) return;
    setPagination((prev) => ({ ...prev, page: next }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Follow people</h2>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} ({u.email})
            <button onClick={() => follow(u._id, "follow")} style={{ marginLeft: 6 }}>Follow</button>
            <button onClick={() => follow(u._id, "unfollow")} style={{ marginLeft: 6 }}>Unfollow</button>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>Unread: {unread}</span>
        <button onClick={markAll} disabled={!notifications.length}>Mark all read</button>
      </div>
      <ul>
        {notifications.map((n) => (
          <li key={n._id} style={{ marginBottom: 8, background: n.read ? "#f7f7f7" : "#e8f5ff", padding: 8, borderRadius: 4 }}>
            <div>{n.message}</div>
            <small>{new Date(n.createdAt).toLocaleString()}</small>
            {!n.read && (
              <div>
                <button onClick={() => markRead(n._id)} style={{ marginTop: 6 }}>Mark read</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => changePage(-1)} disabled={pagination.page <= 1}>Prev</button>
        <span>Page {pagination.page}</span>
        <button onClick={() => changePage(1)} disabled={pagination.page * pagination.limit >= pagination.total}>Next</button>
      </div>
    </div>
  );
}
