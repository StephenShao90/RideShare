import React, { useEffect, useMemo, useState } from "react";

export default function DriverRideRequests() {
  const [postedRides, setPostedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [showMyRides, setShowMyRides] = useState(true);
  const [showIncomingRequests, setShowIncomingRequests] = useState(true);
  const [showPastRides, setShowPastRides] = useState(false);

  useEffect(() => {
    fetchAllData({ initialLoad: true });
  }, []);

  async function fetchAllData({ initialLoad = false } = {}) {
    if (initialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const token = localStorage.getItem("token");

      const [postedRes, requestedRes, incomingRes] = await Promise.all([
        fetch("http://localhost:5000/api/rides/mine/posted", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/api/rides/mine/requested", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/api/ride-requests/driver", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const postedData = await postedRes.json();
      const requestedData = await requestedRes.json();
      const incomingData = await incomingRes.json();

      if (!postedRes.ok) {
        throw new Error(postedData.error || "Failed to load posted rides");
      }

      if (!requestedRes.ok) {
        throw new Error(requestedData.error || "Failed to load requested rides");
      }

      if (!incomingRes.ok) {
        throw new Error(incomingData.error || "Failed to load incoming requests");
      }

      setPostedRides(Array.isArray(postedData) ? postedData : postedData.rides || []);
      setRequestedRides(
        Array.isArray(requestedData) ? requestedData : requestedData.rides || []
      );
      setIncomingRequests(
        Array.isArray(incomingData) ? incomingData : incomingData.requests || []
      );
    } catch (err) {
      setError(err.message || "Something went wrong while loading rides");
    } finally {
      if (initialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }

  async function handleRequestAction(requestId, action) {
    setError("");
    setUpdatingId(requestId);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/ride-requests/${requestId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} request`);
      }

      setIncomingRequests((prev) =>
        prev.map((request) =>
          request.request_id === requestId
            ? {
                ...request,
                request_status: action === "approve" ? "approved" : "rejected",
              }
            : request
        )
      );

      setRequestedRides((prev) =>
        prev.map((ride) =>
          ride.request_id === requestId
            ? {
                ...ride,
                request_status: action === "approve" ? "approved" : "rejected",
              }
            : ride
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const now = new Date();

  const myRides = useMemo(() => {
    const posted = postedRides.map((ride) => ({
      type: "offered",
      sortDate: ride.ride_date,
      ride_id: ride.ride_id,
      origin: ride.origin,
      destination: ride.destination,
      ride_date: ride.ride_date,
      price: ride.price,
      available_seats: ride.available_seats,
      status: "offered",
    }));

    const requested = requestedRides.map((ride) => ({
      type: "requested",
      sortDate: ride.ride_date,
      ride_id: ride.ride_id,
      request_id: ride.request_id,
      origin: ride.origin,
      destination: ride.destination,
      ride_date: ride.ride_date,
      price: ride.price,
      driver_name: ride.driver_name,
      status: ride.request_status || "pending",
    }));

    return [...posted, ...requested].sort(
      (a, b) => new Date(a.sortDate) - new Date(b.sortDate)
    );
  }, [postedRides, requestedRides]);

  const groupedIncomingRequests = useMemo(() => {
    const groups = {};

    for (const request of incomingRequests) {
      if (!groups[request.ride_id]) {
        groups[request.ride_id] = {
          ride_id: request.ride_id,
          origin: request.origin,
          destination: request.destination,
          ride_date: request.ride_date,
          available_seats: request.available_seats,
          price: request.price,
          requests: [],
        };
      }

      groups[request.ride_id].requests.push(request);
    }

    return Object.values(groups).sort(
      (a, b) => new Date(a.ride_date) - new Date(b.ride_date)
    );
  }, [incomingRequests]);

  const upcomingMyRides = useMemo(
    () => myRides.filter((ride) => new Date(ride.ride_date) >= now),
    [myRides]
  );

  const pastMyRides = useMemo(
    () => myRides.filter((ride) => new Date(ride.ride_date) < now),
    [myRides]
  );

  const upcomingIncomingRequests = useMemo(
    () =>
      groupedIncomingRequests.filter(
        (rideGroup) => new Date(rideGroup.ride_date) >= now
      ),
    [groupedIncomingRequests]
  );

  const pastIncomingRequests = useMemo(
    () =>
      groupedIncomingRequests.filter(
        (rideGroup) => new Date(rideGroup.ride_date) < now
      ),
    [groupedIncomingRequests]
  );

  const pastRideGroups = useMemo(() => {
    const grouped = {};

    for (const ride of pastMyRides) {
      const key = `${ride.type}-${ride.ride_id}-${ride.request_id || "none"}`;
      grouped[key] = ride;
    }

    return Object.values(grouped).sort(
      (a, b) => new Date(b.ride_date) - new Date(a.ride_date)
    );
  }, [pastMyRides]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
              My Rides
            </h1>
            <p
              style={{
                marginTop: "8px",
                color: "#7c2d12",
                fontSize: "1rem",
              }}
            >
              View rides you posted, rides you requested, and their latest approval
              status.
            </p>
          </div>

          <div
            style={{
              marginBottom: "18px",
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => fetchAllData()}
              disabled={refreshing || loading}
              style={{
                height: "44px",
                border: "none",
                borderRadius: "12px",
                padding: "0 16px",
                background: refreshing || loading ? "#fdba74" : "#f97316",
                color: "#fff",
                fontWeight: "700",
                cursor: refreshing || loading ? "not-allowed" : "pointer",
              }}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {refreshing && !loading && (
              <span
                style={{
                  color: "#9a3412",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                }}
              >
                Updating rides...
              </span>
            )}
          </div>

          {error && (
            <div
              style={{
                marginBottom: "18px",
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

          {loading ? (
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
              Loading your rides...
            </div>
          ) : (
            <>
              <SectionHeader
                title={`My Rides (${upcomingMyRides.length})`}
                isOpen={showMyRides}
                onToggle={() => setShowMyRides((prev) => !prev)}
              />

              {showMyRides && (
                <div style={{ marginBottom: "34px" }}>
                  {upcomingMyRides.length === 0 ? (
                    <EmptyBox text="You have no upcoming posted or requested rides." />
                  ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                      {upcomingMyRides.map((ride) => (
                        <RideCard
                          key={`${ride.type}-${ride.request_id || ride.ride_id}`}
                          ride={ride}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <SectionHeader
                title={`Incoming Requests On My Posted Rides (${upcomingIncomingRequests.length})`}
                isOpen={showIncomingRequests}
                onToggle={() => setShowIncomingRequests((prev) => !prev)}
              />

              {showIncomingRequests && (
                <div style={{ marginBottom: "34px" }}>
                  {upcomingIncomingRequests.length === 0 ? (
                    <EmptyBox text="No upcoming incoming ride requests yet." />
                  ) : (
                    <div style={{ display: "grid", gap: "20px" }}>
                      {upcomingIncomingRequests.map((rideGroup) => (
                        <div
                          key={rideGroup.ride_id}
                          style={{
                            border: "1px solid #fdba74",
                            borderRadius: "20px",
                            background: "linear-gradient(180deg, #ffffff, #fff7ed)",
                            boxShadow: "0 10px 30px rgba(234, 88, 12, 0.08)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              padding: "20px",
                              borderBottom: "1px solid #fed7aa",
                              background: "#fffaf5",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "16px",
                                flexWrap: "wrap",
                              }}
                            >
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                    color: "#9a3412",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {rideGroup.origin} → {rideGroup.destination}
                                </h3>
                                <p style={{ margin: "8px 0 0 0", color: "#7c2d12" }}>
                                  {new Date(rideGroup.ride_date).toLocaleString()}
                                </p>
                              </div>

                              <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, color: "#7c2d12" }}>
                                  <strong style={{ color: "#9a3412" }}>Seats left:</strong>{" "}
                                  {rideGroup.available_seats}
                                </p>
                                <p
                                  style={{
                                    margin: "8px 0 0 0",
                                    color: "#ea580c",
                                    fontWeight: "800",
                                  }}
                                >
                                  ${Number(rideGroup.price || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div style={{ padding: "20px", display: "grid", gap: "14px" }}>
                            {rideGroup.requests.map((request) => {
                              const isPending = request.request_status === "pending";
                              const isUpdating = updatingId === request.request_id;

                              return (
                                <div
                                  key={request.request_id}
                                  style={{
                                    border: "1px solid #fed7aa",
                                    borderRadius: "16px",
                                    padding: "16px",
                                    background: "#ffffff",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: "12px",
                                      flexWrap: "wrap",
                                      marginBottom: "10px",
                                    }}
                                  >
                                    <div>
                                      <p style={detailStyle}>
                                        <strong style={labelStyle}>Rider:</strong>{" "}
                                        {request.rider_name}
                                      </p>
                                      <p style={detailStyle}>
                                        <strong style={labelStyle}>Email:</strong>{" "}
                                        {request.rider_email}
                                      </p>
                                      <p style={detailStyle}>
                                        <strong style={labelStyle}>Requested:</strong>{" "}
                                        {new Date(
                                          request.request_created_at
                                        ).toLocaleString()}
                                      </p>
                                    </div>

                                    <span
                                      style={getStatusPillStyle(request.request_status)}
                                    >
                                      {request.request_status}
                                    </span>
                                  </div>

                                  {isPending && (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "12px",
                                        marginTop: "12px",
                                      }}
                                    >
                                      <button
                                        onClick={() =>
                                          handleRequestAction(request.request_id, "approve")
                                        }
                                        disabled={isUpdating}
                                        style={{
                                          flex: 1,
                                          border: "none",
                                          borderRadius: "12px",
                                          padding: "12px",
                                          background: isUpdating ? "#86efac" : "#16a34a",
                                          color: "#fff",
                                          fontWeight: "700",
                                          cursor: isUpdating ? "not-allowed" : "pointer",
                                        }}
                                      >
                                        {isUpdating ? "Updating..." : "Approve"}
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleRequestAction(request.request_id, "reject")
                                        }
                                        disabled={isUpdating}
                                        style={{
                                          flex: 1,
                                          border: "none",
                                          borderRadius: "12px",
                                          padding: "12px",
                                          background: isUpdating ? "#fca5a5" : "#dc2626",
                                          color: "#fff",
                                          fontWeight: "700",
                                          cursor: isUpdating ? "not-allowed" : "pointer",
                                        }}
                                      >
                                        {isUpdating ? "Updating..." : "Reject"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <SectionHeader
                title={`Past Rides (${pastRideGroups.length + pastIncomingRequests.length})`}
                isOpen={showPastRides}
                onToggle={() => setShowPastRides((prev) => !prev)}
              />

              {showPastRides && (
                <div>
                  {pastRideGroups.length === 0 && pastIncomingRequests.length === 0 ? (
                    <EmptyBox text="No past rides yet." />
                  ) : (
                    <div style={{ display: "grid", gap: "24px" }}>
                      {pastRideGroups.length > 0 && (
                        <div>
                          <h3
                            style={{
                              margin: "0 0 14px 0",
                              color: "#9a3412",
                            }}
                          >
                            My Past Rides
                          </h3>
                          <div style={{ display: "grid", gap: "16px" }}>
                            {pastRideGroups.map((ride) => (
                              <RideCard
                                key={`past-${ride.type}-${ride.request_id || ride.ride_id}`}
                                ride={ride}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {pastIncomingRequests.length > 0 && (
                        <div>
                          <h3
                            style={{
                              margin: "0 0 14px 0",
                              color: "#9a3412",
                            }}
                          >
                            Past Incoming Requests
                          </h3>

                          <div style={{ display: "grid", gap: "20px" }}>
                            {pastIncomingRequests.map((rideGroup) => (
                              <div
                                key={`past-request-${rideGroup.ride_id}`}
                                style={{
                                  border: "1px solid #fdba74",
                                  borderRadius: "20px",
                                  background: "#fffaf5",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    padding: "20px",
                                    borderBottom: "1px solid #fed7aa",
                                  }}
                                >
                                  <h3
                                    style={{
                                      margin: 0,
                                      color: "#9a3412",
                                      fontSize: "1.1rem",
                                    }}
                                  >
                                    {rideGroup.origin} → {rideGroup.destination}
                                  </h3>
                                  <p style={{ margin: "8px 0 0 0", color: "#7c2d12" }}>
                                    {new Date(rideGroup.ride_date).toLocaleString()}
                                  </p>
                                </div>

                                <div style={{ padding: "20px", display: "grid", gap: "12px" }}>
                                  {rideGroup.requests.map((request) => (
                                    <div
                                      key={request.request_id}
                                      style={{
                                        border: "1px solid #fed7aa",
                                        borderRadius: "14px",
                                        padding: "14px",
                                        background: "#fff",
                                      }}
                                    >
                                      <p style={detailStyle}>
                                        <strong style={labelStyle}>Rider:</strong>{" "}
                                        {request.rider_name}
                                      </p>
                                      <p style={detailStyle}>
                                        <strong style={labelStyle}>Email:</strong>{" "}
                                        {request.rider_email}
                                      </p>
                                      <p style={detailStyle}>
                                        <strong style={labelStyle}>Status:</strong>{" "}
                                        <span style={statusTextStyle(request.request_status)}>
                                          {request.request_status}
                                        </span>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        marginBottom: "16px",
        border: "1px solid #fdba74",
        borderRadius: "16px",
        padding: "16px 18px",
        background: "#fffaf5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        color: "#9a3412",
        fontWeight: "800",
        fontSize: "1.05rem",
      }}
    >
      <span>{title}</span>
      <span style={{ fontSize: "1.2rem" }}>{isOpen ? "−" : "+"}</span>
    </button>
  );
}

function EmptyBox({ text }) {
  return (
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
      {text}
    </div>
  );
}

function RideCard({ ride }) {
  return (
    <div
      style={{
        border: "1px solid #fdba74",
        borderRadius: "18px",
        padding: "18px",
        background: "#fffaf5",
        boxShadow: "0 8px 24px rgba(234, 88, 12, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#9a3412",
              fontSize: "1.08rem",
            }}
          >
            {ride.origin} → {ride.destination}
          </h3>
          <p style={{ margin: "8px 0 0 0", color: "#7c2d12" }}>
            {new Date(ride.ride_date).toLocaleString()}
          </p>

          {ride.type === "offered" ? (
            <>
              <p style={detailStyle}>
                <strong style={labelStyle}>Type:</strong> Offered ride
              </p>
              <p style={detailStyle}>
                <strong style={labelStyle}>Seats left:</strong> {ride.available_seats}
              </p>
            </>
          ) : (
            <>
              <p style={detailStyle}>
                <strong style={labelStyle}>Type:</strong> Requested ride
              </p>
              <p style={detailStyle}>
                <strong style={labelStyle}>Driver:</strong> {ride.driver_name || "Unknown"}
              </p>
            </>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              color: "#ea580c",
              fontWeight: "800",
            }}
          >
            ${Number(ride.price || 0).toFixed(2)}
          </p>

          <span style={getStatusPillStyle(ride.status)}>{ride.status}</span>
        </div>
      </div>
    </div>
  );
}

function getStatusPillStyle(status) {
  return {
    display: "inline-block",
    background:
      status === "approved"
        ? "#dcfce7"
        : status === "rejected"
        ? "#ffe4e6"
        : status === "pending"
        ? "#ffedd5"
        : "#e0f2fe",
    color:
      status === "approved"
        ? "#166534"
        : status === "rejected"
        ? "#be123c"
        : status === "pending"
        ? "#c2410c"
        : "#075985",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: "700",
    textTransform: "capitalize",
  };
}

function statusTextStyle(status) {
  return {
    color:
      status === "approved"
        ? "#166534"
        : status === "rejected"
        ? "#be123c"
        : status === "pending"
        ? "#c2410c"
        : "#075985",
    fontWeight: "700",
    textTransform: "capitalize",
  };
}

const detailStyle = {
  margin: "4px 0",
  color: "#7c2d12",
  fontSize: "0.97rem",
  lineHeight: "1.45",
};

const labelStyle = {
  color: "#9a3412",
};
