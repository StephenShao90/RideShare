import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "", pfp: "" });

  useEffect(() => {
    async function fetchDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [dashboardResponse, notificationResponse, profileResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/dashboard", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:5000/api/ride-requests/driver", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:5000/api/users/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (
          dashboardResponse.status === 401 ||
          dashboardResponse.status === 403 ||
          notificationResponse.status === 401 ||
          notificationResponse.status === 403 ||
          profileResponse.status === 401 ||
          profileResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin", { replace: true });
          return;
        }

        const dashboardResult = await dashboardResponse.json();
        const notificationResult = await notificationResponse.json();
        const profileResult = await profileResponse.json();

        console.log("DASHBOARD RESPONSE:", dashboardResult);
        console.log("NOTIFICATION RESPONSE:", notificationResult);
        console.log("PROFILE RESPONSE:", profileResult);

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardResult.details ||
              dashboardResult.error ||
              "Failed to load dashboard"
          );
        }

        if (!notificationResponse.ok) {
          throw new Error(
            notificationResult.details ||
              notificationResult.error ||
              "Failed to load notifications"
          );
        }

        if (!profileResponse.ok) {
          throw new Error(
            profileResult.details ||
              profileResult.error ||
              "Failed to load profile"
          );
        }

        setData(dashboardResult);

        setProfile({
          name: profileResult.name || "",
          pfp: profileResult.pfp_url || "",
        });

        const pendingRequests = Array.isArray(notificationResult)
          ? notificationResult.filter(
              (request) => request.request_status === "pending"
            )
          : [];

        setNotifications(pendingRequests);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin", { replace: true });
  }

  const unreadCount = notifications.length;

  if (loading) {
    return (
      <main className="container section">
        <div className="card">
          <h2>Loading dashboard...</h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container section">
        <div className="card">
          <h2>Error: {error}</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="dashboard-header" style={{ position: "relative" }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: 6 }}>
            Dashboard
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Your live RideShare account activity.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/edit-profile")}
              title="Edit Profile"
              style={{
                width: 46,
                height: 46,
                borderRadius: "999px",
                border: "2px solid #fdba74",
                background: "#fff7ed",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                boxShadow: "0 10px 24px rgba(249, 115, 22, 0.12)",
              }}
            >
              {profile.pfp ? (
                <img
                  src={`http://localhost:5000${profile.pfp}`}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#9a3412",
                  }}
                >
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              title="Notifications"
              style={{
                position: "relative",
                width: 46,
                height: 46,
                borderRadius: "999px",
                border: "none",
                background: "#f97316",
                color: "#fff",
                fontSize: "1.2rem",
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(249, 115, 22, 0.25)",
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    minWidth: 20,
                    height: 20,
                    padding: "0 6px",
                    borderRadius: "999px",
                    background: "#dc2626",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: 56,
                  right: 0,
                  width: 340,
                  background: "#fff",
                  border: "1px solid #fdba74",
                  borderRadius: 16,
                  padding: 14,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                  zIndex: 50,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12, color: "#9a3412" }}>
                  Notifications
                </h3>

                {notifications.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>
                    No new requests.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {notifications.map((item) => (
                      <button
                        key={item.request_id}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/driver/requests");
                        }}
                        style={{
                          textAlign: "left",
                          border: "1px solid #fed7aa",
                          borderRadius: 12,
                          background: "#fff7ed",
                          padding: 12,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#9a3412",
                            marginBottom: 4,
                          }}
                        >
                          You have a new request
                        </div>
                        <div style={{ color: "#7c2d12", fontSize: "0.95rem" }}>
                          {item.rider_name} requested {item.origin} to{" "}
                          {item.destination}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn btn-danger" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <section className="stats-grid" style={{ marginBottom: 22 }}>
        <button
          type="button"
          className="card"
          onClick={() => navigate("/driver/requests")}
          style={{
            textAlign: "left",
            cursor: "pointer",
            border: "1px solid #fdba74",
            background: "#fff",
          }}
        >
          <h3>Upcoming Rides</h3>
          <div className="stat-number">{data.upcomingRides}</div>
          <p className="muted">Click to view ride details and members.</p>
        </button>

        <div className="card">
          <h3>Completed Trips</h3>
          <div className="stat-number">{data.completedTrips}</div>
          <p className="muted">Trips you have already finished.</p>
        </div>

        <div className="card">
          <h3>Total Earnings</h3>
          <div className="stat-number">${data.totalEarnings.toFixed(2)}</div>
          <p className="muted">Completed ride earnings so far.</p>
        </div>
      </section>

      <section className="two-col">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Recent Activity</h2>

          {data.recentActivity.length === 0 ? (
            <p className="muted">
              No rides yet. Once you create or complete rides, they will appear
              here.
            </p>
          ) : (
            data.recentActivity.map((ride) => (
              <div className="activity-item" key={ride.id}>
                <strong>
                  {ride.origin} to {ride.destination}
                </strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  {new Date(ride.ride_date).toLocaleString()} | {ride.status} | $
                  {Number(ride.price).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Quick Actions</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/request-ride")}
            >
              Find a Ride
            </button>
            <button
              className="btn btn-success"
              onClick={() => navigate("/offer-ride")}
            >
              Offer a Ride
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}