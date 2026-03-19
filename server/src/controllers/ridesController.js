import pool from "../db/db.js";

export async function searchRides(req, res) {
  const { origin = "", destination = "", date = "" } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT id, driver_id, origin, destination, ride_date, available_seats, price, status, created_at
      FROM rides
      WHERE origin ILIKE $1
        AND destination ILIKE $2
        AND ($3 = '' OR DATE(ride_date) = $3::date)
      ORDER BY ride_date ASC
      `,
      [`%${origin}%`, `%${destination}%`, date]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("SEARCH RIDES ERROR:", error);
    res.status(500).json({
      error: "Failed to search rides",
    });
  }
}

export async function createRide(req, res) {
  const { origin, destination, ride_date, available_seats, price } = req.body;

  if (!origin || !destination || !ride_date || !available_seats) {
    return res.status(400).json({
      error: "Origin, destination, ride date, and available seats are required",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO rides (driver_id, origin, destination, ride_date, available_seats, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        req.user.userId,
        origin,
        destination,
        ride_date,
        available_seats,
        price ?? 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE RIDE ERROR:", error);
    res.status(500).json({
      error: "Failed to create ride",
    });
  }
}

/* rides the current user posted */
export async function getMyPostedRides(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        id AS ride_id,
        origin,
        destination,
        ride_date,
        available_seats,
        price
      FROM rides
      WHERE driver_id = $1
      ORDER BY ride_date ASC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("getMyPostedRides error:", err);
    res.status(500).json({ error: "Failed to load posted rides" });
  }
}


/* rides the user requested */
export async function getMyRequestedRides(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        rr.id AS request_id,
        r.id AS ride_id,
        r.origin,
        r.destination,
        r.ride_date,
        r.price,
        rr.status AS request_status,
        u.name AS driver_name
      FROM ride_requests rr
      JOIN rides r
        ON rr.ride_id = r.id
      JOIN users u
        ON r.driver_id = u.id
      WHERE rr.rider_id = $1
      ORDER BY r.ride_date ASC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("getMyRequestedRides error:", err);
    res.status(500).json({ error: "Failed to load requested rides" });
  }
}
