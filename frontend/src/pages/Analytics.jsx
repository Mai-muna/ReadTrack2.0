import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../AuthContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [userStats, setUserStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [goalTarget, setGoalTarget] = useState("");
  const { user } = useAuth();

  const load = async () => {
    const userRes = await api.get("/analytics/user");
    setUserStats(userRes.data);

    if (user?.role === "admin") {
      const adminRes = await api.get("/analytics/admin");
      setAdminStats(adminRes.data);
    }
  };

  useEffect(() => {
    load().catch((e) => console.error(e));
    // eslint-disable-next-line
  }, [user?.role]);

  const saveGoal = async () => {
    const year = new Date().getFullYear();
    await api.post("/analytics/goal", { year, target: Number(goalTarget || 0) });
    setGoalTarget("");
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Analytics</h2>

      {userStats && (
        <>
          <h3>Your reading status</h3>
          <pre>{JSON.stringify(userStats.statusCounts, null, 2)}</pre>

          <h3>Yearly goal</h3>
          <p>
            Target: {userStats.goal?.target || 0} | Completed: {userStats.goal?.completed || 0}
          </p>
          <div style={{ display: "flex", gap: 8, maxWidth: 320 }}>
            <input
              placeholder="Set goal (books/year)"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
            />
            <button onClick={saveGoal}>Save</button>
          </div>

          <h3>Books finished per month (this year)</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={userStats.monthlyFinished || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {adminStats && (
        <>
          <h3>System stats</h3>
          <pre>{JSON.stringify(adminStats, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
