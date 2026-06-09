const axios = require("axios");
const { getAccessToken } = require("../config/auth");

const BASE_URL =
  "http://20.244.56.144/evaluation-service";

async function sendLog(
  stack,
  level,
  packageName,
  message
) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${BASE_URL}/logs`,
      {
        stack,
        level,
        package: packageName,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Log API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
}

module.exports = {
  sendLog
};