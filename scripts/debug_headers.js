require('dotenv').config();
const axios = require("axios");

const SENDMATOR_API_KEY = process.env.SENDMATOR_API_KEY;
const BASE_URL = "https://api.sendmator.com/api/v1";

async function testHeader(name, headers) {
    console.log(`\nTesting ${name}...`);
    const payload = {
        channels: ["email"],
        recipients: { email: "test@example.com" }
    };
    try {
        const response = await axios.post(`${BASE_URL}/otp/send`, payload, { headers });
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Failed:", e.response?.data?.message || e.message);
        if (e.response?.status) console.error("Status:", e.response.status);
    }
}

async function run() {
    await testHeader("Bearer Only", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SENDMATOR_API_KEY}`
    });

    await testHeader("X-API-Key Only", {
        "Content-Type": "application/json",
        "X-API-Key": SENDMATOR_API_KEY
    });

    // Also try without /api/v1 prefix just in case the manual was wrong but the 500 confirms path exists? 
    // 500 means server reached. Path is likely correct.
}

run();
