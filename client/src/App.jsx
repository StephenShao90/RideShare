import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";

import Home from "./pages/Home.jsx";
import SignIn from "./pages/SignIn.jsx";
import CreateAccount from "./pages/CreateAccount.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RequestRide from "./pages/RequestRide.jsx";
import OfferRide from "./pages/OfferRide.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import DriverRideRequests from "./pages/DriverRideRequests.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  const location = useLocation();

  const hideChatbot =
    location.pathname === "/" ||
    location.pathname === "/signin" ||
    location.pathname === "/create-account";

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/create-account" element={<CreateAccount />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/requests"
          element={
            <ProtectedRoute>
              <DriverRideRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request-ride"
          element={
            <ProtectedRoute>
              <RequestRide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offer-ride"
          element={
            <ProtectedRoute>
              <OfferRide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideChatbot && <ChatbotWidget />}
    </div>
  );
}