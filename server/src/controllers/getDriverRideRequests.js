export async function getDriverRideRequests(req, res) {
  const driverId = req.user.userId;

  try {
    const result = await pool.query(
      `
      SELECT
        rr.id AS request_id,
        rr.status AS request_status,
        rr.created_at AS request_created_at,
        rr.ride_id,
        r.origin,
        r.destination,
        r.ride_date,
        r.available_seats,
        r.price,
        u.id AS rider_user_id,
        u.name AS rider_name,
        u.email AS rider_email
      FROM ride_requests rr
      JOIN rides r ON rr.ride_id = r.id
      JOIN users u ON rr.rider_id = u.id
      WHERE r.driver_id = $1
      ORDER BY r.ride_date ASC, rr.created_at ASC
      `,
      [driverId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET DRIVER RIDE REQUESTS ERROR:", error);
    res.status(500).json({
      error: "Failed to load incoming ride requests",
    });
  }
}
