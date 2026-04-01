import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { chatWithAgent } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", authMiddleware, chatWithAgent);

export default router;