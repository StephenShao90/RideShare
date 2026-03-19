import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
  });

  const [pfp, setPfp] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin", { replace: true });
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile");
        }

        setForm({
          name: data.name || "",
          bio: data.bio || "",
        });

        setEmail(data.email || "");
        setPreview(data.pfp_url ? `http://localhost:5000${data.pfp_url}` : "");
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePfpChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPfp(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      if (pfp) formData.append("pfp", pfp);

      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin", { replace: true });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setPreview(data.pfp_url ? `http://localhost:5000${data.pfp_url}` : preview);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Loading profile...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div
        className="card"
        style={{
          maxWidth: 820,
          margin: "0 auto",
          border: "1px solid #fdba74",
          boxShadow: "0 16px 40px rgba(249, 115, 22, 0.12)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            className="section-title"
            style={{ marginBottom: 8, color: "#9a3412" }}
          >
            Edit Profile
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Update your profile details, bio, and profile picture.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 18,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                margin: "0 auto 14px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #fdba74",
                background: "#fff",
                boxShadow: "0 10px 24px rgba(249, 115, 22, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {preview ? (
                <img
                  src={preview}
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
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: "#9a3412",
                  }}
                >
                  {form.name ? form.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>

            <div
              style={{
                fontWeight: 700,
                color: "#9a3412",
                marginBottom: 6,
                fontSize: "1.05rem",
              }}
            >
              {form.name || "Your Profile"}
            </div>

            <div
              style={{
                color: "#7c2d12",
                fontSize: "0.95rem",
                marginBottom: 16,
                wordBreak: "break-word",
              }}
            >
              {email}
            </div>

            <label
              htmlFor="pfp-upload"
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: 999,
                background: "#f97316",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(249, 115, 22, 0.24)",
              }}
            >
              Upload Photo
            </label>
            <input
              id="pfp-upload"
              type="file"
              accept="image/*"
              onChange={handlePfpChange}
              style={{ display: "none" }}
            />

            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: "#9a3412",
                fontSize: "0.88rem",
              }}
            >
              JPG, PNG, or WEBP up to 5MB
            </p>
          </div>

          <div style={{ display: "grid", gap: 22 }}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#9a3412",
                  }}
                >
                  Username
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Username"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                    color: "#9a3412",
                  }}
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell riders a little about yourself..."
                  rows={5}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: 120,
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{
                    minWidth: 170,
                    fontWeight: 700,
                  }}
                >
                  Save Profile
                </button>
              </div>
            </form>

            {message && (
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #86efac",
                  color: "#166534",
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontWeight: 600,
                }}
              >
                {message}
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #fdba74",
  outline: "none",
  fontSize: "1rem",
  background: "#fff",
  color: "#1f2937",
  boxSizing: "border-box",
};