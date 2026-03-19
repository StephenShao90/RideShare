import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero container">
        <h1 className="hero-title">
          Share rides
          <br />
          save money
          <br />
          move smarter
        </h1>

        <p className="hero-subtitle">
          RideShare helps drivers post trips and helps passengers find affordable,
          convenient rides with a smoother and simpler experience.
        </p>

        <div className="hero-actions">
          <Link to="/create-account">
            <button className="btn btn-primary">Create Account</button>
          </Link>

          <Link to="/signin">
            <button className="btn btn-secondary">Sign In</button>
          </Link>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">Why use RideShare?</h2>

        <div className="feature-grid">
          <div className="card">
            <h3>Post rides easily</h3>
            <p className="muted">
              Drivers can offer trips and manage availability in one place.
            </p>
          </div>

          <div className="card">
            <h3>Find better matches</h3>
            <p className="muted">
              Passengers can discover rides that fit their route and schedule.
            </p>
          </div>

          <div className="card">
            <h3>Track activity</h3>
            <p className="muted">
              View upcoming rides, requests, and trip history from your dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}