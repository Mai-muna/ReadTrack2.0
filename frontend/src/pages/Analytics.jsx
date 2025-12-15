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

  const renderBars = (stats = []) => {
    const friendly = {
      wantToRead: "Want to read",
      currentlyReading: "Currently reading",
      finished: "Finished",
    };
    const maxVal = Math.max(...stats.map((s) => s.count), 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stats.map((s) => (
          <div key={s._id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{friendly[s._id] || s._id}</span>
              <strong>{s.count}</strong>
            </div>
            <div style={{ background: "#eee", height: 10, borderRadius: 4 }}>
              <div
                style={{
                  width: `${Math.round((s.count / maxVal) * 100)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #38bdf8, #6366f1)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Analytics</h2>
      {userStats && (
        <div style={{ marginBottom: 24, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <h3>Your reading status</h3>
          {userStats.stats?.length ? (
            <>
              {renderBars(userStats.stats)}
              {userStats.topGenre?.length ? (
                <p style={{ marginTop: 12 }}>Top genre: <strong>{userStats.topGenre[0]._id}</strong></p>
              ) : (
                <p style={{ marginTop: 12 }}>Add more books to see your top genre.</p>
              )}
            </>
          ) : (
            <p>No data yet. Add books to your reading list to unlock insights.</p>
          )}
        </div>
      )}
      {adminStats && (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <h3>System stats</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(adminStats.systemStats || {}).map(([label, value]) => (
              <div key={label} style={{ minWidth: 140, padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
                <div style={{ textTransform: "capitalize", color: "#4b5563" }}>{label.replace("total", "total ")}</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Reading list status (all users)</h4>
            {adminStats.readingListBreakdown?.length ? (
              renderBars(adminStats.readingListBreakdown)
            ) : (
              <p>No reading list data yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
