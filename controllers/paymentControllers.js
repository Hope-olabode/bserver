const https = require("https");


const initializeTransaction = async (req, res) => {
  try {
    const { email, amount } = req.body; // Amount in kobo (smallest unit)
    console.log("Request body:", req.body);

    const params = JSON.stringify({
      email,
      amount,
    });

    console.log("Request parameters:", params);

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer sk_test_3ab485fa33de2425648a7d603e0fab9a3ac5e88d`, // Keep this secure
        "Content-Type": "application/json",
      },
    };

    console.log("HTTPS request options:", options);

    const request = https.request(options, (response) => {
      let data = "";
      console.log("Status Code:", response.statusCode);

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        console.log("Raw response data:", data);
        try {
          const responseData = JSON.parse(data);
          console.log("Parsed response data:", responseData);
          if (responseData.status) {
            console.log("Transaction initialized successfully:", responseData.data);
            return res.json(responseData.data); // Send only necessary data
          } else {
            console.error("Transaction initialization failed:", responseData);
            return res
              .status(500)
              .json({ message: "Transaction initialization failed" });
          }
        } catch (jsonError) {
          console.error("Error parsing response data:", jsonError);
          return res
            .status(500)
            .json({ message: "Error parsing response data" });
        }
      });
    });

    request.on("error", (error) => {
      console.error("Request error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the request" });
    });

    request.write(params);
    request.end();
    console.log("HTTPS request sent.");
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  initializeTransaction,
};
