import React, { useState } from "react";

export default function OfferRide() {
  // Stores all form input values.
  // ride_date and ride_time are kept separate in the UI,
  // then combined before sending to the backend.
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    ride_date: "",
    ride_time: "",
    available_seats: 1,
    price: 0,
  });

  // Message shown when the ride is created successfully.
  const [message, setMessage] = useState("");

  // Error shown when validation or the backend request fails.
  const [error, setError] = useState("");

  // Tracks whether the form is currently submitting.
  const [loading, setLoading] = useState(false);

  // Builds one timestamp only when both date and time exist.
  // Example result: "2026-04-30T12:30:00"
  const rideDateTime =
    form.ride_date && form.ride_time
      ? `${form.ride_date}T${form.ride_time}:00`
      : "";

  // Updates the form field that changed.
  // The input name must match the property in the form state.
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Clear old messages before trying to submit again.
    setMessage("");
    setError("");

    // Basic frontend validation before calling the backend.
    if (!form.origin || !form.destination) {
      setError("Origin and destination are required");
      return;
    }

    if (!form.ride_date || !form.ride_time) {
      setError("Please select both a ride date and ride time");
      return;
    }

    if (!form.available_seats || Number(form.available_seats) < 1) {
      setError("Available seats must be at least 1");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5001/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        // Send ride_date as one combined timestamp because the backend
        // already expects one field called ride_date.
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          ride_date: rideDateTime,
          available_seats: Number(form.available_seats),
          price: Number(form.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create ride");
      }

      setMessage("Ride created successfully");

      // Reset the form after a successful submission.
      setForm({
        origin: "",
        destination: "",
        ride_date: "",
        ride_time: "",
        available_seats: 1,
        price: 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          maxWidth: "900px",
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
              Offer a Ride
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#7c2d12",
                fontSize: "1rem",
              }}
            >
              Share your trip details and post a ride for passengers to find.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Origin</label>
              <input
                type="text"
                name="origin"
                placeholder="Enter pickup city"
                value={form.origin}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Destination</label>
              <input
                type="text"
                name="destination"
                placeholder="Enter destination city"
                value={form.destination}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Ride Date</label>
              <input
                type="date"
                name="ride_date"
                value={form.ride_date}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Ride Time</label>
              <input
                type="time"
                name="ride_time"
                value={form.ride_time}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Available Seats</label>
              <input
                type="number"
                name="available_seats"
                min="1"
                value={form.available_seats}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Price</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                style={inputStyle}
                required
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
              {loading ? "Posting..." : "Post Ride"}
            </button>
          </form>

          {message && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#ecfdf5",
                border: "1px solid #86efac",
                color: "#166534",
                fontWeight: "500",
              }}
            >
              {message}
            </div>
          )}

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

          <div
            style={{
              marginTop: "28px",
              padding: "22px",
              borderRadius: "18px",
              background: "#fff7ed",
              border: "1px dashed #fb923c",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                color: "#9a3412",
                fontSize: "1.15rem",
              }}
            >
              Ride Preview
            </h2>

            <div style={{ display: "grid", gap: "10px" }}>
              <p style={detailStyle}>
                <strong style={labelTextStyle}>From:</strong>{" "}
                {form.origin || "Not set"}
              </p>

              <p style={detailStyle}>
                <strong style={labelTextStyle}>To:</strong>{" "}
                {form.destination || "Not set"}
              </p>

              <p style={detailStyle}>
                <strong style={labelTextStyle}>Date:</strong>{" "}
                {rideDateTime
                  ? new Date(rideDateTime).toLocaleString()
                  : "Not set"}
              </p>

              <p style={detailStyle}>
                <strong style={labelTextStyle}>Seats:</strong>{" "}
                {form.available_seats}
              </p>

              <p style={detailStyle}>
                <strong style={labelTextStyle}>Price:</strong> $
                {Number(form.price || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared label styling for each form field.
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#9a3412",
};

// Shared input styling for text, date, time, and number inputs.
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

// Styling for each preview row.
const detailStyle = {
  margin: 0,
  color: "#7c2d12",
  fontSize: "0.97rem",
  lineHeight: "1.45",
};

// Styling for the bold labels inside the preview card.
const labelTextStyle = {
  color: "#9a3412",
};