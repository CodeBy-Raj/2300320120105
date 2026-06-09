const {
  Log
} = require("./utils/logger");

(async () => {
  try {

    const response =
      await Log(
        "backend",
        "info",
        "service",
        "Logging middleware working"
      );

    console.log(response);

  } catch (err) {
    console.error(err.message);
  }
})();