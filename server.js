const express = require('express');
const multer = require('multer');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files
app.use(express.static(__dirname));

// Simple photo endpoint
app.post('/api/send-photo', upload.single('photo'), (req, res) => {
    console.log('=== PHOTO REQUEST START ===');
    console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? 'EXISTS' : 'MISSING');
    console.log('Chat ID:', process.env.TELEGRAM_CHAT_ID ? 'EXISTS' : 'MISSING');
    console.log('File received:', !!req.file);
    
    if (!req.file) {
        return res.status(400).send('No file');
    }
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
        return res.status(500).send('Missing credentials');
    }
    
    // Simple HTTP request to Telegram
    const boundary = Math.random().toString(36).substring(2);
    const formData = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="chat_id"',
        '',
        chatId,
        `--${boundary}`,
        'Content-Disposition: form-data; name="photo"; filename="photo.jpg"',
        'Content-Type: image/jpeg',
        '',
    ].join('\r\n');
    
    const endBoundary = `\r\n--${boundary}--\r\n`;
    const contentLength = Buffer.byteLength(formData) + req.file.buffer.length + Buffer.byteLength(endBoundary);
    
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${botToken}/sendPhoto`,
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': contentLength
        }
    };
    
    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            console.log('Telegram response:', data);
            if (response.statusCode === 200) {
                res.json({ success: true });
            } else {
                res.status(500).json({ error: data });
            }
        });
    });
    
    request.on('error', (error) => {
        console.error('Request error:', error);
        res.status(500).json({ error: error.message });
    });
    
    // Write the form data
    request.write(formData);
    request.write(req.file.buffer);
    request.write(endBoundary);
    request.end();
    
    console.log('=== PHOTO REQUEST END ===');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Bot configured:', !!process.env.TELEGRAM_BOT_TOKEN);
    console.log('Chat configured:', !!process.env.TELEGRAM_CHAT_ID);
});
