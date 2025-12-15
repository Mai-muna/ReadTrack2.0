import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";

export default function Social() {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const load = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data.filter((u) => u._id !== (user?.id || user?._id)));
      const notif = await api.get("/social/notifications");
      setNotifications(notif.data);
    } catch (err) {
      console.error("Social load failed", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const follow = async (id, action) => {
    await api.post(`/social/${action}/${id}`);
    load();
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

      <h3>Notifications</h3>
      <ul>
        {notifications.map((n) => (
          <li key={n._id}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
}
