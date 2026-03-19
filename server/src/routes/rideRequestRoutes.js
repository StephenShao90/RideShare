import express from "express";
import {
  createRideRequest,
  getDriverRideRequests,
  approveRideRequest,
  rejectRideRequest,
} from "../controllers/rideRequestController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRideRequest);
router.get("/driver", protect, getDriverRideRequests);
router.patch("/:requestId/approve", protect, approveRideRequest);
router.patch("/:requestId/reject", protect, rejectRideRequest);

export default router;
