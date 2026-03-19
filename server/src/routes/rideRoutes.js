import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  searchRides,
  createRide,
  getMyPostedRides,
  getMyRequestedRides
} from "../controllers/ridesController.js";

const router = express.Router();

/* search rides */
router.get("/search", authMiddleware, searchRides);

/* create ride */
router.post("/", authMiddleware, createRide);

/* rides I posted */
router.get("/mine/posted", authMiddleware, getMyPostedRides);

/* rides I requested */
router.get("/mine/requested", authMiddleware, getMyRequestedRides);

export default router;
