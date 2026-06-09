const {
  sendLog
} = require("../services/loggerService");

async function Log(
  stack,
  level,
  packageName,
  message
) {
  return await sendLog(
    stack,
    level,
    packageName,
    message
  );
}

module.exports = {
  Log
};