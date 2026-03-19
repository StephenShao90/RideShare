import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing environment variable: JWT_SECRET");
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    if (trimmedName.length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters long",
      });
    }

    if (rawPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [trimmedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email already in use",
      });
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const insertResult = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
      `,
      [trimmedName, trimmedEmail, passwordHash]
    );

    const user = insertResult.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR FULL:", error);
    return res.status(500).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    const result = await pool.query(
      `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = $1
      `,
      [trimmedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(rawPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR FULL:", error);
    return res.status(500).json({
      error: "Failed to sign in",
      details: error.message,
    });
  }
}