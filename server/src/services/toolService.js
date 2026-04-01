import pool from "../db/db.js";

function normalizeDateInput(date = "") {
  return String(date).trim();
}

function normalizeTimeInput(time = "") {
  return String(time).trim().toLowerCase();
}

function convertTo24HourTime(time = "") {
  const raw = normalizeTimeInput(time);

  if (!raw) {
    throw new Error("Time is required.");
  }

  const simpleMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!simpleMatch) {
    throw new Error(
      "Invalid time format. Please use something like 9am, 9:30am, 14:00, or 7 pm."
    );
  }

  let hours = Number(simpleMatch[1]);
  const minutes = Number(simpleMatch[2] || "00");
  const meridiem = simpleMatch[3]?.toLowerCase() || null;

  if (minutes < 0 || minutes > 59) {
    throw new Error("Invalid time format.");
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      throw new Error("Invalid time format.");
    }

    if (meridiem === "am") {
      if (hours === 12) hours = 0;
    } else if (meridiem === "pm") {
      if (hours !== 12) hours += 12;
    }
  } else {
    if (hours < 0 || hours > 23) {
      throw new Error("Invalid time format.");
    }
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function buildRideDateTime(date = "", time = "") {
  const cleanedDate = normalizeDateInput(date);
  const cleanedTime = convertTo24HourTime(time);

  if (!cleanedDate) {
    throw new Error("Date is required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD.");
  }

  const combined = `${cleanedDate} ${cleanedTime}`;

  const testDate = new Date(`${cleanedDate}T${cleanedTime}`);
  if (Number.isNaN(testDate.getTime())) {
    throw new Error("Invalid ride date or time.");
  }

  return combined;
}

export async function getAvailableRides(args = {}) {
  const { from = "", to = "", date = "" } = args;

  const result = await pool.query(
    `
    SELECT
      r.id,
      u.name AS driver,
      r.origin AS from,
      r.destination AS to,
      r.ride_date AS date,
      r.available_seats AS "seatsLeft",
      r.price
    FROM rides r
    JOIN users u
      ON r.driver_id = u.id
    WHERE r.origin ILIKE $1
      AND r.destination ILIKE $2
      AND ($3 = '' OR DATE(r.ride_date) = $3::date)
      AND r.ride_date >= NOW()
      AND r.status = 'scheduled'
    ORDER BY r.ride_date ASC
    `,
    [`%${from}%`, `%${to}%`, date]
  );

  return {
    ok: true,
    rides: result.rows,
  };
}

export async function createRide(args = {}) {
  const {
    userId,
    origin = "",
    destination = "",
    date = "",
    time = "",
    available_seats = 1,
    price = 0,
  } = args;

  if (!userId) {
    throw new Error("User authentication is required to create a ride.");
  }

  if (!origin || !destination || !date || !time || !available_seats) {
    throw new Error(
      "Origin, destination, date, time, and available seats are required."
    );
  }

  const rideDate = buildRideDateTime(date, time);

  const rideDateMs = new Date(rideDate).getTime();

  if (rideDateMs <= Date.now()) {
    throw new Error("Ride date must be in the future.");
  }

  const result = await pool.query(
    `
    INSERT INTO rides (
      driver_id,
      origin,
      destination,
      ride_date,
      available_seats,
      price
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [userId, origin, destination, rideDate, available_seats, price]
  );

  return {
    ok: true,
    message: "Ride created successfully.",
    ride: result.rows[0],
  };
}

export async function createRideRequest(args = {}) {
  const { userId, selectedRideId = null } = args;

  if (!userId) {
    throw new Error("User authentication is required to request a ride.");
  }

  if (!selectedRideId) {
    throw new Error("A ride selection is required.");
  }

  const rideResult = await pool.query(
    `
    SELECT id, driver_id, available_seats, status
    FROM rides
    WHERE id = $1
    `,
    [selectedRideId]
  );

  if (rideResult.rows.length === 0) {
    throw new Error("Ride not found.");
  }

  const ride = rideResult.rows[0];

  if (ride.driver_id === userId) {
    throw new Error("You cannot request your own ride.");
  }

  if (ride.available_seats < 1) {
    throw new Error("No seats available.");
  }

  const existingRequest = await pool.query(
    `
    SELECT id, status
    FROM ride_requests
    WHERE ride_id = $1 AND rider_id = $2
    `,
    [selectedRideId, userId]
  );

  if (existingRequest.rows.length > 0) {
    throw new Error("You already requested this ride.");
  }

  const result = await pool.query(
    `
    INSERT INTO ride_requests (ride_id, rider_id, status)
    VALUES ($1, $2, 'pending')
    RETURNING *
    `,
    [selectedRideId, userId]
  );

  return {
    ok: true,
    message: "Ride request created successfully.",
    request: result.rows[0],
  };
}

export async function getUserDashboard(args = {}) {
  const { userId = null } = args;

  if (!userId) {
    throw new Error("User authentication is required.");
  }

  const posted = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM rides
    WHERE driver_id = $1
      AND ride_date >= NOW()
      AND status = 'scheduled'
    `,
    [userId]
  );

  const requested = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM ride_requests rr
    JOIN rides r
      ON rr.ride_id = r.id
    WHERE rr.rider_id = $1
      AND r.ride_date >= NOW()
      AND rr.status IN ('pending', 'approved')
    `,
    [userId]
  );

  return {
    ok: true,
    summary: {
      upcomingRides: posted.rows[0].count + requested.rows[0].count,
      offeredRides: posted.rows[0].count,
      requestedRides: requested.rows[0].count,
      userId,
    },
  };
}

export async function runTool(name, args) {
  switch (name) {
    case "getAvailableRides":
      return await getAvailableRides(args);
    case "createRide":
      return await createRide(args);
    case "createRideRequest":
      return await createRideRequest(args);
    case "getUserDashboard":
      return await getUserDashboard(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}