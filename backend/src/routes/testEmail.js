// routes/testEmail.js
const express = require("express");
const router = express.Router();
const emailService = require("../utils/emailService");
router.get("/test-email", async (req, res) => {
  try {
    await emailService.sendMail({
      to: "muhammadsaniharuna44@gmail.com", // CHANGE THIS
      subject: "🚀 Railway Email Test",
      html: "<h2>If you see this, Resend works 🎉</h2>",
    });

    res.json({ ok: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
