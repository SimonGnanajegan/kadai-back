const axios = require("axios");

const SENDMATOR_API_KEY = process.env.SENDMATOR_API_KEY;
const BASE_URL = "https://sendmator.com/api/v1";

/**
 * Send OTP via Sendmator
 * @param {string} identifier - Mobile number or Email
 * @param {string} type - 'email' or 'whatsapp' or 'sms'
 */
exports.sendOtp = async (identifier, type = "email") => {
    try {
        // Use X-API-Key header only, as Bearer caused 401
        const headers = {
            "Content-Type": "application/json",
            "X-API-Key": SENDMATOR_API_KEY
        };

        // Map internal type 'mobile' to API 'whatsapp' (preferred) or 'sms'
        // API allows: email, sms, whatsapp
        let channel = String(type).toLowerCase();

        if (channel === "mobile") {
            channel = "whatsapp"; // Defaulting to whatsapp as per latest request
        }

        // Validate channel to avoid API errors
        const validChannels = ["email", "sms", "whatsapp"];
        if (!validChannels.includes(channel)) {
            // If unknown type, default to 'whatsapp' if it looks like a phone number (not email), else 'email'
            // But 'identifier' check is better done outside. Here we just enforce validity.
            // If we can't map it, we might error, but let's try to be smart.
            if (identifier.includes("@")) channel = "email";
            else channel = "whatsapp";
        }

        const payload = {
            channels: [channel],
            recipients: {
                [channel]: identifier
            }
        };

        console.log(`Sending OTP to ${identifier} via ${type} at ${BASE_URL}/otp/send`);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post(`${BASE_URL}/otp/send`, payload, { headers });
        console.log("Sendmator Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Sendmator Send OTP Error:", error.response?.data || error.message);
        // Fallback or rethrow
        throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
};

/**
 * Verify OTP via Sendmator
 * @param {string} identifier - Mobile number or Email
 * @param {string} otp - The code to verify
 */
exports.verifyOtp = async (identifier, otp) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            "X-API-Key": SENDMATOR_API_KEY
        };

        const payload = {
            recipient: identifier,
            otp: otp,
        };

        const response = await axios.post(`${BASE_URL}/otp/verify`, payload, { headers });
        console.log("Verify Response:", response.data);

        if (response.data.status === "success" || response.data.verified === true) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Sendmator Verify OTP Error:", error.response?.data || error.message);
        return false;
    }
};
