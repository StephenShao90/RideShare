import pool from "../db/db.js";

export async function getDashboardData(req, res) {
  try {
    const userId = req.user.userId;

    const upcomingRidesPromise = pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM rides
      WHERE driver_id = $1
        AND ride_date >= NOW()
        AND status = 'scheduled'
      `,
      [userId]
    );

    const completedTripsPromise = pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM rides
      WHERE driver_id = $1
        AND status = 'completed'
      `,
      [userId]
    );

    const totalEarningsPromise = pool.query(
      `
      SELECT COALESCE(SUM(price), 0)::numeric AS total
      FROM rides
      WHERE driver_id = $1
        AND status = 'completed'
      `,
      [userId]
    );

    const recentActivityPromise = pool.query(
      `
      SELECT id, origin, destination, ride_date, available_seats, price, status, created_at
      FROM rides
      WHERE driver_id = $1
      ORDER BY ride_date DESC
      LIMIT 10
      `,
      [userId]
    );

    const [
      upcomingRidesResult,
      completedTripsResult,
      totalEarningsResult,
      recentActivityResult,
    ] = await Promise.all([
      upcomingRidesPromise,
      completedTripsPromise,
      totalEarningsPromise,
      recentActivityPromise,
    ]);

    return res.status(200).json({
      upcomingRides: upcomingRidesResult.rows[0].count,
      completedTrips: completedTripsResult.rows[0].count,
      totalEarnings: Number(totalEarningsResult.rows[0].total),
      recentActivity: recentActivityResult.rows,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR FULL:", error);
    return res.status(500).json({
      error: "Failed to load dashboard",
      details: error.message,
    });
  }
}