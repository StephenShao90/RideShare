import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function CreateAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const rawText = await response.text();
      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        console.error("Non-JSON response from server:", rawText);
        throw new Error(
          "Server returned HTML instead of JSON. Check your backend route."
        );
      }

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to create account");
      }

      if (!data.token || !data.user) {
        throw new Error("Server response is missing token or user data");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("authChange"));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page">
      <div className="card form-card">
        <h1 className="form-title">Create account</h1>
        <p className="form-subtitle">
          Join RideShare and start posting or finding rides.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              className="input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 18 }}>
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </main>
  );
}