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
  getNotifications
} = require(
  "./services/notificationService"
);

const {
  getTop10
} = require(
  "./utils/priorityCalculator"
);

(async () => {

  try {

    const token =
      await getAccessToken();

    await Log(
      "backend",
      "info",
      "service",
      "Fetching notifications"
    );

    const notifications =
      await getNotifications(token);

    const top10 =
      getTop10(notifications);

    console.log(
      "\nTop 10 Notifications\n"
    );

    console.table(top10);

    await Log(
      "backend",
      "info",
      "service",
      "Priority inbox generated"
    );

  } catch (error) {

    await Log(
      "backend",
      "error",
      "service",
      error.message
    );

    console.error(error);
  }

})();