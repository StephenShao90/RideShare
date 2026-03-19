import pool from "../db/db.js";

export async function createRideRequest(req, res) {
  const { ride_id } = req.body;
  const riderId = req.user.userId;

  if (!ride_id) {
    return res.status(400).json({
      error: "ride_id is required",
    });
  }

  try {
    const rideResult = await pool.query(
      `
      SELECT id, driver_id, available_seats, status
      FROM rides
      WHERE id = $1
      `,
      [ride_id]
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({
        error: "Ride not found",
      });
    }

    const ride = rideResult.rows[0];

    if (ride.driver_id === riderId) {
      return res.status(400).json({
        error: "You cannot request your own ride",
      });
    }

    if (ride.available_seats < 1) {
      return res.status(400).json({
        error: "No seats available",
      });
    }

    const existingRequest = await pool.query(
      `
      SELECT id, status
      FROM ride_requests
      WHERE ride_id = $1 AND rider_id = $2
      `,
      [ride_id, riderId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        error: "You already requested this ride",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO ride_requests (ride_id, rider_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [ride_id, riderId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE RIDE REQUEST ERROR:", error);
    res.status(500).json({
      error: "Failed to create ride request",
    });
  }
}

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

export async function approveRideRequest(req, res) {
  const driverId = req.user.userId;
  const { requestId } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT
        rr.id,
        rr.status AS request_status,
        rr.ride_id,
        rr.rider_id,
        r.driver_id,
        r.available_seats
      FROM ride_requests rr
      JOIN rides r ON rr.ride_id = r.id
      WHERE rr.id = $1
      FOR UPDATE
      `,
      [requestId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Request not found" });
    }

    const request = result.rows[0];

    if (request.driver_id !== driverId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Not authorized" });
    }

    if (request.request_status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Request is not pending" });
    }

    if (request.available_seats < 1) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No seats available" });
    }

    await client.query(
      `
      UPDATE ride_requests
      SET status = 'approved'
      WHERE id = $1
      `,
      [requestId]
    );

    await client.query(
      `
      UPDATE rides
      SET available_seats = available_seats - 1
      WHERE id = $1
      `,
      [request.ride_id]
    );

    await client.query("COMMIT");

    res.status(200).json({ message: "Request approved" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("APPROVE RIDE REQUEST ERROR:", error);
    res.status(500).json({ error: "Failed to approve request" });
  } finally {
    client.release();
  }
}

export async function rejectRideRequest(req, res) {
  const driverId = req.user.userId;
  const { requestId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        rr.id,
        rr.status AS request_status,
        r.driver_id
      FROM ride_requests rr
      JOIN rides r ON rr.ride_id = r.id
      WHERE rr.id = $1
      `,
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = result.rows[0];

    if (request.driver_id !== driverId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (request.request_status !== "pending") {
      return res.status(400).json({ error: "Request is not pending" });
    }

    await pool.query(
      `
      UPDATE ride_requests
      SET status = 'rejected'
      WHERE id = $1
      `,
      [requestId]
    );

    res.status(200).json({ message: "Request rejected" });
  } catch (error) {
    console.error("REJECT RIDE REQUEST ERROR:", error);
    res.status(500).json({ error: "Failed to reject request" });
  }
}
