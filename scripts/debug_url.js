require('dotenv').config();
const axios = require("axios");

const SENDMATOR_API_KEY = process.env.SENDMATOR_API_KEY;

async function testUrl(url) {
    console.log(`\nTesting URL: ${url}...`);
    const payload = {
        channels: ["email"],
        recipients: { email: "simongnanajegan@gmail.com" } // Try a real-looking email
    };
    const headers = {
        "Content-Type": "application/json",
        "X-API-Key": SENDMATOR_API_KEY
    };
    try {
        const response = await axios.post(`${url}/otp/send`, payload, { headers });
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Failed:", e.response?.data?.message || e.message);
        if (e.response?.status) console.error("Status:", e.response.status);
    }
}

async function run() {
    await testUrl("https://api.sendmator.com/api/v1");
    await testUrl("https://sendmator.com/api/v1");
}

run();
