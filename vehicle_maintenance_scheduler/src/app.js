const {
  getAccessToken
} = require(
  "../../logging_middleware/src/config/auth"
);

const {
  Log
} = require(
  "../../logging_middleware/src/utils/logger"
);

const {
  getDepots,
  getVehicles
} = require(
  "./services/schedulerService"
);

const {
  solveKnapsack
} = require(
  "./utils/knapsack"
);

(async () => {

  try {

    const token =
      await getAccessToken();

    await Log(
      "backend",
      "info",
      "service",
      "Fetching depots"
    );

    const depots =
      await getDepots(token);

    const vehicles =
      await getVehicles(token);

    for (
      const depot of depots
    ) {

      const result =
        solveKnapsack(
          vehicles,
          depot.MechanicHours
        );

      console.log(
        `Depot ${depot.ID}`
      );

      console.log(
        "Max Impact:",
        result.maxImpact
      );

      console.log(
        "Tasks:",
        result.selectedTasks
          .length
      );

      await Log(
        "backend",
        "info",
        "service",
        `Processed depot ${depot.ID}`
      );
    }

  } catch (err) {

    await Log(
      "backend",
      "error",
      "service",
      err.message
    );

    console.error(err);
  }

})();