const express = require("express");
const app = express();
const axios = require("axios"); // Import the Axios library
const cheerio = require("cheerio");

// Middleware for parsing POST request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/sendSMS", async function (req, res) {
  //const userMessage = "hello"; // Replace with the user's message
  const userMessage = req.body[0].contact.last_message;
  const UserId = req.body[0].contact.id;
  //console.log(lastMessage);
  var access_token = "";
  const requestBody = {
    grant_type: "client_credentials",
    client_id: "955f726af06b1e45803dc979b8191406",
    client_secret: "a8f6510fa6f6b13f4de45a7f9ad97984",
  };

  axios
    .post("https://api.sendpulse.com/oauth/access_token", requestBody)
    .then((response) => {
      access_token = response.data.access_token; // Access the 'access_token' from 'response.data'
      console.log("Access Token:", access_token);

      // Custom message
      return axios.post(
        "https://valudio-backend.azurewebsites.net/api/docs/chat",
        {
          question: userMessage, // Use the user's message as the question
          CookiesId: "your_cookies_id", // Provide the appropriate CookiesId
        }
      );
    })
    .then((CustomResponse) => {
      const responseMessage = CustomResponse.data.answer;
      const $ = cheerio.load(responseMessage);
      const plainTextResponse = $.text();
      console.log(plainTextResponse);
      //   plainTextResponse =
      //     "Bending is the process of applying force to a sheet metal ";
      // Instagram message reply

      const CustomRequestBody = {
        contact_id: UserId,
        message_type: "RESPONSE",
        message_tag: "ACCOUNT_UPDATE",
        text: plainTextResponse,
      };

      return axios.post(
        "https://api.sendpulse.com/messenger/contacts/sendText",
        CustomRequestBody,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
    })
    .then((response) => {
      console.log("Instagram Response:", response.data);
      res.status(200).end();
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).end();
    });
});

app.listen(6000);
