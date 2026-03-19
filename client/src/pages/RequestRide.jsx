import React, { useState } from "react";

export default function RequestRide() {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    date: "",
  });
  const [rides, setRides] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestingRideId, setRequestingRideId] = useState(null);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        origin: form.origin,
        destination: form.destination,
        date: form.date,
      }).toString();

      const response = await fetch(
        `http://localhost:5000/api/rides/search?${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search rides");
      }

      setRides(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestRide(rideId) {
    setError("");
    setRequestingRideId(rideId);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/ride-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ride_id: rideId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request ride");
      }

      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride.id === rideId
            ? { ...ride, request_status: "pending" }
            : ride
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingRideId(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 50px rgba(234, 88, 12, 0.12)",
            border: "1px solid #fdba74",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                color: "#9a3412",
                fontWeight: "800",
              }}
            >
              Find a Ride
            </h1>
            <p
              style={{
                marginTop: "8px",
                color: "#7c2d12",
                fontSize: "1rem",
              }}
            >
              Search available rides quickly and book the one that fits your trip.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#9a3412",
                }}
              >
                Origin
              </label>
              <input
                type="text"
                name="origin"
                placeholder="Enter pickup city"
                value={form.origin}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#9a3412",
                }}
              >
                Destination
              </label>
              <input
                type="text"
                name="destination"
                placeholder="Enter destination city"
                value={form.destination}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#9a3412",
                }}
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: "48px",
                border: "none",
                borderRadius: "14px",
                background: loading
                  ? "#fdba74"
                  : "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 12px 24px rgba(249, 115, 22, 0.25)",
                transition: "0.2s ease",
              }}
            >
              {loading ? "Searching..." : "Search Rides"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#fff1f2",
                border: "1px solid #fda4af",
                color: "#be123c",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginTop: "30px" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                color: "#9a3412",
                marginBottom: "14px",
              }}
            >
              Available Rides
            </h2>

            {rides.length === 0 && !loading ? (
              <div
                style={{
                  padding: "24px",
                  borderRadius: "18px",
                  background: "#fff7ed",
                  border: "1px dashed #fb923c",
                  color: "#9a3412",
                  textAlign: "center",
                }}
              >
                No rides found yet. Try searching for a route and date.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {rides.map((ride) => {
                  const isPending = ride.request_status === "pending";
                  const isApproved = ride.request_status === "approved";
                  const isRequesting = requestingRideId === ride.id;

                  return (
                    <div
                      key={ride.id}
                      style={{
                        background: "linear-gradient(180deg, #ffffff, #fff7ed)",
                        border: "1px solid #fdba74",
                        borderRadius: "20px",
                        padding: "20px",
                        boxShadow: "0 10px 30px rgba(234, 88, 12, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <span
                          style={{
                            background: "#ffedd5",
                            color: "#c2410c",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                          }}
                        >
                          {ride.status}
                        </span>

                        <span
                          style={{
                            color: "#ea580c",
                            fontWeight: "800",
                            fontSize: "1.1rem",
                          }}
                        >
                          ${ride.price}
                        </span>
                      </div>

                      <div style={{ display: "grid", gap: "10px" }}>
                        <p style={detailStyle}>
                          <strong style={labelStyle}>From:</strong> {ride.origin}
                        </p>
                        <p style={detailStyle}>
                          <strong style={labelStyle}>To:</strong> {ride.destination}
                        </p>
                        <p style={detailStyle}>
                          <strong style={labelStyle}>Date:</strong>{" "}
                          {new Date(ride.ride_date).toLocaleString()}
                        </p>
                        <p style={detailStyle}>
                          <strong style={labelStyle}>Seats:</strong>{" "}
                          {ride.available_seats}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRequestRide(ride.id)}
                        disabled={isPending || isApproved || isRequesting}
                        style={{
                          marginTop: "18px",
                          width: "100%",
                          border: "none",
                          borderRadius: "12px",
                          padding: "12px",
                          background:
                            isPending || isApproved || isRequesting
                              ? "#fdba74"
                              : "#f97316",
                          color: "#fff",
                          fontWeight: "700",
                          cursor:
                            isPending || isApproved || isRequesting
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isApproved
                          ? "Approved"
                          : isPending
                          ? "Request Sent"
                          : isRequesting
                          ? "Sending..."
                          : "Request This Ride"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: "48px",
  padding: "0 14px",
  borderRadius: "14px",
  border: "1px solid #fdba74",
  background: "#fffaf5",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
};

const detailStyle = {
  margin: 0,
  color: "#7c2d12",
  fontSize: "0.97rem",
  lineHeight: "1.45",
};

const labelStyle = {
  color: "#9a3412",
};