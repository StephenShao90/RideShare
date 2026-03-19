export async function getAvailableRides(args = {}) {
  const { from = "", to = "", date = "" } = args;

  return {
    ok: true,
    rides: [
      {
        id: 1,
        driver: "Alex",
        from,
        to,
        date,
        seatsLeft: 2,
        price: 18,
      },
      {
        id: 2,
        driver: "Sam",
        from,
        to,
        date,
        seatsLeft: 1,
        price: 15,
      },
    ],
  };
}

export async function createRideRequest(args = {}) {
  const {
    from = "",
    to = "",
    date = "",
    seats = 1,
    selectedRideId = null,
    selectedDriver = null,
  } = args;

  return {
    ok: true,
    message: "Ride request created successfully.",
    request: {
      id: Math.floor(Math.random() * 100000),
      from,
      to,
      date,
      seats,
      selectedRideId,
      selectedDriver,
      status: "pending",
    },
  };
}

export async function getUserDashboard(args = {}) {
  const { userId = null } = args;

  return {
    ok: true,
    summary: {
      upcomingRides: 2,
      offeredRides: 1,
      requestedRides: 1,
      userId,
    },
  };
}

export async function runTool(name, args) {
  switch (name) {
    case "getAvailableRides":
      return await getAvailableRides(args);
    case "createRideRequest":
      return await createRideRequest(args);
    case "getUserDashboard":
      return await getUserDashboard(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}