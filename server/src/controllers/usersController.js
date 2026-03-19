import pool from "../db/db.js";

export async function getCurrentUser(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, bio, pfp_url
      FROM users
      WHERE id = $1
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    res.status(500).json({
      error: "Failed to load user",
    });
  }
}

export async function updateCurrentUser(req, res) {
  try {
    const userId = req.user.userId;

    const { name, bio } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    // get existing user (so we don’t overwrite pfp accidentally)
    const existingUserResult = await pool.query(
      `
      SELECT pfp_url
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (existingUserResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const existingUser = existingUserResult.rows[0];

    // if a new file is uploaded → use it
    // otherwise keep old one
    const newPfpUrl = req.file
      ? `/uploads/${req.file.filename}`
      : existingUser.pfp_url || "";

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1,
          bio = $2,
          pfp_url = $3
      WHERE id = $4
      RETURNING id, name, email, bio, pfp_url
      `,
      [name.trim(), bio || "", newPfpUrl, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    res.status(500).json({
      error: "Failed to update user",
    });
  }
}