import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import rideRequestRoutes from "./routes/rideRequestRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { testDbConnection } from "./db/db.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  // Allows Vercel preview URLs for this project/account
  if (
    origin.endsWith(".vercel.app") &&
    origin.includes("ride-share") &&
    origin.includes("stephenshao90")
  ) {
    return true;
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors());

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "RideShare API is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "rideshare-api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/ride-requests", rideRequestRoutes);
app.use("/api/users", userRoutes);

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Allowed origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("SERVER START ERROR:", error);
    process.exit(1);
  }
}

startServer();