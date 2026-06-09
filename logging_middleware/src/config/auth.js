const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const BASE_URL =
  "http://4.224.186.213/evaluation-service";

async function registerClient() {


  try {
    const response = await axios.post(
      `${BASE_URL}/register`,
      {
        email: process.env.EMAIL,
        name: process.env.NAME,
        mobileNo: process.env.MOBILE,
        githubUsername:
          process.env.GITHUB_USERNAME,
        rollNo: process.env.ROLL_NO,
        accessCode: process.env.ACCESS_CODE,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Registration Error:",
      error.response?.data || error.message
    );
  }
}
async function getAccessToken() {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth`,
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        email: process.env.EMAIL,
        name: process.env.NAME,
        rollNo: process.env.ROLL_NO,
        accessCode: process.env.ACCESS_CODE
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Auth Error:",
      error.response?.data || error.message
    );
  }
}


module.exports = {
  registerClient,
  getAccessToken
};