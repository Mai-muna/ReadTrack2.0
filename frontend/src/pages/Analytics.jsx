import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";

export default function Analytics() {
  const [userStats, setUserStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await api.get("/analytics/user");
        setUserStats(userRes.data);
        if (user?.role === "admin") {
          const adminRes = await api.get("/analytics/admin");
          setAdminStats(adminRes.data);
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    };
    load();
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Analytics</h2>
      {userStats && (
        <div>
          <h3>Your reading status</h3>
          <pre>{JSON.stringify(userStats, null, 2)}</pre>
        </div>
      )}
      {adminStats && (
        <div>
          <h3>System stats</h3>
          <pre>{JSON.stringify(adminStats, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
