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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "RideShare API is running",
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
    });
  } catch (error) {
    console.error("SERVER START ERROR:", error);
    process.exit(1);
  }
}

startServer();