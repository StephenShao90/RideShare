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
        date: { type: "string" },
      },
      required: ["from", "to", "date"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "createRideRequest",
    description: "Create a ride request using known trip details or a selected ride.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        date: { type: "string" },
        seats: { type: "number" },
        selectedRideId: { type: "number" },
        selectedDriver: { type: "string" },
      },
      required: ["from", "to", "date", "seats"],
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

export async function runRideShareAgent({ message, history = [], user, session }) {
  const input = [
    {
      role: "system",
      content: `
You are RideShare Assistant.

Rules:
1. Be helpful, short, and natural.
2. Do not repeatedly ask for details that already exist in chat history or session memory.
3. Use session memory when the user says things like:
   - "ride 1"
   - "Alex"
   - "that one"
   - "book it"
   - "1 seat"
4. If the user previously searched rides, and then picks one ride, use the previous search details.
5. If enough information exists to create a ride request, call createRideRequest instead of asking again.
6. If the user is missing only one field, ask only for that one missing field.
7. Never ask for all fields again unless none are known.

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

  let updatedSession = { ...session };

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

      if (call.name === "createRideRequest") {
        const draft = updatedSession.lastRequestDraft || {};
        const rides = updatedSession.lastSearch?.rides || [];

        const mergedArgs = {
          from: args.from || draft.from,
          to: args.to || draft.to,
          date: args.date || draft.date,
          seats: args.seats || draft.seats || 1,
          selectedRideId: args.selectedRideId || updatedSession.lastRideSelection?.id || null,
          selectedDriver:
            args.selectedDriver || updatedSession.lastRideSelection?.driver || null,
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

      const alexSelected = lower.includes("alex");
      const samSelected = lower.includes("sam");

      if (alexSelected) {
        const selected = rides.find((r) => r.driver.toLowerCase() === "alex");
        if (selected) {
          updatedSession.lastRideSelection = {
            id: selected.id,
            driver: selected.driver,
          };
        }
      }

      if (samSelected) {
        const selected = rides.find((r) => r.driver.toLowerCase() === "sam");
        if (selected) {
          updatedSession.lastRideSelection = {
            id: selected.id,
            driver: selected.driver,
          };
        }
      }
    }

    const seatMatch = lower.match(/(\d+)\s*(seat|seats|person|people)/);
    if (seatMatch) {
      updatedSession.lastRequestDraft = {
        ...(updatedSession.lastRequestDraft || {}),
        seats: Number(seatMatch[1]),
      };
    }
  }
}