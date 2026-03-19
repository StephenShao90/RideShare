import { runRideShareAgent } from "../services/aiService.js";

// Temporary in-memory session store for dev
const sessionStore = new Map();

function getSessionKey(req) {
  if (req.user?.userId) {
    return `user:${req.user.userId}`;
  }
  return req.ip || "anonymous";
}

export async function chatWithAgent(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "A message is required.",
      });
    }

    const sessionKey = getSessionKey(req);

    if (!sessionStore.has(sessionKey)) {
      sessionStore.set(sessionKey, {
        lastSearch: null,
        lastRideSelection: null,
        lastRequestDraft: {},
      });
    }

    const session = sessionStore.get(sessionKey);

    const result = await runRideShareAgent({
      message,
      history,
      user: req.user || null,
      session,
    });

    sessionStore.set(sessionKey, result.updatedSession || session);

    return res.status(200).json({
      reply: result.reply,
      session: result.updatedSession,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      error: error.message || "Chat processing failed",
    });
  }
}