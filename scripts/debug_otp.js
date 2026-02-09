const otpService = require("../src/services/otp.service");

// Mock axios if needed, but we want real call.
// We just need to run this.

async function test() {
    console.log("Testing Email...");
    try {
        await otpService.sendOtp("test@example.com", "email");
        console.log("Email success");
    } catch (e) {
        console.error("Email failed:", e.message);
    }

    console.log("\nTesting Whatsapp...");
    try {
        await otpService.sendOtp("919876543210", "mobile"); // Should map to whatsapp
        console.log("Whatsapp success");
    } catch (e) {
        console.error("Whatsapp failed:", e.message);
    }
}

test();
