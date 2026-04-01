import OpenAI from "openai";
import { runTool } from "./toolService.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const tools = [
  {
    type: "function",
    name: "getAvailableRides",
    description: "Find available rides for a route and date.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        date: {
          type: "string",
          description: "Calendar date in YYYY-MM-DD format.",
        },
      },
      required: ["from", "to", "date"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "createRide",
    description: "Create a new ride as a driver.",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string" },
        destination: { type: "string" },
        date: {
          type: "string",
          description: "Calendar date in YYYY-MM-DD format.",
        },
        time: {
          type: "string",
          description: "Local ride time like 9am, 9:30am, 14:00, or 7 pm.",
        },
        available_seats: { type: "number" },
        price: { type: "number" },
      },
      required: ["origin", "destination", "date", "time", "available_seats"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "createRideRequest",
    description: "Create a ride request using a selected ride.",
    parameters: {
      type: "object",
      properties: {
        selectedRideId: { type: "number" },
      },
      required: ["selectedRideId"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getUserDashboard",
    description: "Get the user's dashboard summary.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number" },
      },
      required: ["userId"],
      additionalProperties: false,
    },
  },
];

function formatHistory(history = []) {
  return history.map((msg) => ({
    role: msg.role,
    content: msg.text,
  }));
}

export async function runRideShareAgent({
  message,
  history = [],
  user,
  session,
}) {
  const today = new Date().toISOString().slice(0, 10);

  const input = [
    {
      role: "system",
      content: `
You are RideAgent, the assistant for a ride-sharing app.

Today's date is ${today}.

Rules:
1. Be helpful, short, and natural.
2. Do not ask for information that already exists in chat history or session memory.
3. If the user wants to find or book a ride, use getAvailableRides first.
4. If the user selects a ride after a search, use createRideRequest.
5. If the user wants to offer or post a ride, use createRide.
6. Never create a ride unless origin, destination, date, time, and available seats are known.
7. If the date is known but the time is missing, ask only for the time.
8. When calling tools, always convert relative dates like "today", "tomorrow", and "next Friday" into YYYY-MM-DD using today's date above.
9. Never guess a ride time.
10. If the user says "tomorrow morning", "tomorrow evening", or anything similarly vague, ask for an exact time.
11. For ride creation, remember partial ride details until enough exists to create the ride.
12. If the user gives additional ride details in a follow-up message, combine them with session memory instead of starting over.

Session memory:
${JSON.stringify(session, null, 2)}
      `.trim(),
    },
    ...formatHistory(history),
    {
      role: "user",
      content: message,
    },
  ];

  let response = await client.responses.create({
    model: MODEL,
    input,
    tools,
  });

  let updatedSession = {
    ...session,
    lastRideDraft: { ...(session.lastRideDraft || {}) },
    lastRequestDraft: { ...(session.lastRequestDraft || {}) },
  };

  while (true) {
    const functionCalls = (response.output || []).filter(
      (item) => item.type === "function_call"
    );

    if (functionCalls.length === 0) {
      return {
        reply: response.output_text || "I could not generate a response.",
        updatedSession,
      };
    }

    const toolOutputs = [];
    const lower = message.toLowerCase();

    if (updatedSession.lastSearch?.rides?.length) {
      const rides = updatedSession.lastSearch.rides;

      const rideMatch = lower.match(/ride\s*(\d+)/);
      if (rideMatch) {
        const rideNum = Number(rideMatch[1]);
        const selected = rides.find((r) => r.id === rideNum);
        if (selected) {
          updatedSession.lastRideSelection = {
            id: selected.id,
            driver: selected.driver,
          };
        }
      }

      for (const ride of rides) {
        if (ride.driver && lower.includes(String(ride.driver).toLowerCase())) {
          updatedSession.lastRideSelection = {
            id: ride.id,
            driver: ride.driver,
          };
          break;
        }
      }
    }

    const seatMatch = lower.match(/(\d+)\s*(seat|seats|person|people)/);
    if (seatMatch) {
      updatedSession.lastRideDraft.available_seats = Number(seatMatch[1]);
      updatedSession.lastRequestDraft.seats = Number(seatMatch[1]);
    }

    for (const call of functionCalls) {
      const args = JSON.parse(call.arguments || "{}");

      if (call.name === "getUserDashboard" && user?.userId) {
        args.userId = user.userId;
      }

      if (call.name === "getAvailableRides") {
        const result = await runTool(call.name, args);

        updatedSession.lastSearch = {
          from: args.from,
          to: args.to,
          date: args.date,
          rides: result.rides || [],
        };

        updatedSession.lastRequestDraft = {
          ...(updatedSession.lastRequestDraft || {}),
          from: args.from,
          to: args.to,
          date: args.date,
          seats: updatedSession.lastRequestDraft?.seats || 1,
        };

        toolOutputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        });

        continue;
      }

      if (call.name === "createRide") {
        const mergedArgs = {
          origin: args.origin || updatedSession.lastRideDraft.origin || "",
          destination:
            args.destination || updatedSession.lastRideDraft.destination || "",
          date: args.date || updatedSession.lastRideDraft.date || "",
          time: args.time || updatedSession.lastRideDraft.time || "",
          available_seats:
            args.available_seats ||
            updatedSession.lastRideDraft.available_seats ||
            1,
          price: args.price ?? updatedSession.lastRideDraft.price ?? 0,
          userId: user?.userId || null,
        };

        const result = await runTool(call.name, mergedArgs);

        updatedSession.lastRideDraft = {
          origin: mergedArgs.origin,
          destination: mergedArgs.destination,
          date: mergedArgs.date,
          time: mergedArgs.time,
          available_seats: mergedArgs.available_seats,
          price: mergedArgs.price,
        };

        toolOutputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        });

        continue;
      }

      if (call.name === "createRideRequest") {
        const mergedArgs = {
          selectedRideId:
            args.selectedRideId ||
            updatedSession.lastRideSelection?.id ||
            null,
          userId: user?.userId || null,
        };

        const result = await runTool(call.name, mergedArgs);

        updatedSession.lastRequestDraft = mergedArgs;

        toolOutputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        });

        continue;
      }

      const result = await runTool(call.name, args);

      toolOutputs.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }

    response = await client.responses.create({
      model: MODEL,
      previous_response_id: response.id,
      input: toolOutputs,
      tools,
    });
  }
}