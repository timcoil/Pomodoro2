// DOM Elements
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const addFiveBtn = document.getElementById('add-five-btn');
const workBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const pomodoroCountEl = document.getElementById('pomodoro-count');

// Timer settings
const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds
const POMODOROS_BEFORE_LONG_BREAK = 4; // Number of pomodoros before a long break

// Timer state
let timerMode = 'pomodoro';
let timeLeft = POMODORO_TIME;
let timerId = null;
let isRunning = false;
let pomodoroCount = 0;

// Add these variables at the top of your script
const originalTitle = document.title;
let titleInterval;

// Helper function to format time (adds leading zero if needed)
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Update timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesEl.textContent = formatTime(minutes);
    secondsEl.textContent = formatTime(seconds);
    
    // Update document title
    document.title = `${formatTime(minutes)}:${formatTime(seconds)} - Pomodoro Timer`;
}

// Start timer
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerId);
                isRunning = false;
                
                // Handle timer completion based on mode
                if (timerMode === 'pomodoro') {
                    pomodoroCount++;
                    pomodoroCountEl.textContent = pomodoroCount;
                    
                    // Automatically switch to the appropriate break type
                    if (pomodoroCount % POMODOROS_BEFORE_LONG_BREAK === 0) {
                        setTimerMode('longBreak');
                    } else {
                        setTimerMode('shortBreak');
                    }
                } else {
                    // After a break, switch back to pomodoro
                    setTimerMode('pomodoro');
                }
                
                // Play sound or notification here
                playNotification();
                
                // Auto-start the next timer (uncomment if desired)
                // startTimer();
            }
        }, 1000);
    }
    
    // Start updating the title with remaining time
    updateTitleWithTime();
    
    // Set up interval to update the title regularly
    titleInterval = setInterval(updateTitleWithTime, 1000);
}

// Pause timer
function pauseTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    // Reset the title to original
    document.title = originalTitle;
    
    // Clear the title update interval
    clearInterval(titleInterval);
}

// Reset timer
function resetTimer() {
    pauseTimer();
    
    // Set time based on current mode
    if (timerMode === 'pomodoro') {
        timeLeft = POMODORO_TIME;
    } else if (timerMode === 'shortBreak') {
        timeLeft = SHORT_BREAK_TIME;
    } else if (timerMode === 'longBreak') {
        timeLeft = LONG_BREAK_TIME;
    }
    
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Reset the title to original
    document.title = originalTitle;
    
    // Clear the title update interval
    clearInterval(titleInterval);
}

// Set timer mode
function setTimerMode(mode) {
    // Pause the timer if it's running
    if (isRunning) {
        pauseTimer();
    }
    
    timerMode = mode;
    
    // Reset active class on all mode buttons
    workBtn.classList.remove('active');
    shortBreakBtn.classList.remove('active');
    longBreakBtn.classList.remove('active');
    
    // Set timeLeft and active button based on mode
    if (mode === 'pomodoro') {
        timeLeft = POMODORO_TIME; 
        workBtn.classList.add('active');
    } else if (mode === 'shortBreak') {
        timeLeft = SHORT_BREAK_TIME;
        shortBreakBtn.classList.add('active');
    } else if (mode === 'longBreak') {
        timeLeft = LONG_BREAK_TIME;
        longBreakBtn.classList.add('active');
    }
    
    updateDisplay();
}

// Play notification sound
function playNotification() {
    // Create audio element
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play().catch(error => {
        console.error('Failed to play notification sound:', error);
    });
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        let message = '';
        if (timerMode === 'pomodoro') {
            message = pomodoroCount % POMODOROS_BEFORE_LONG_BREAK === 0 
                ? 'Time for a long break!' 
                : 'Time for a short break!';
        } else {
            message = 'Break is over. Time to focus!';
        }
        
        new Notification('Pomodoro Timer', {
            body: message,
            icon: 'https://via.placeholder.com/48'
        });
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Function to add 5 minutes to the timer
function addFiveMinutes() {
    // Add 5 minutes (300 seconds) to the timer
    timeLeft += 300;
    
    // Update display
    updateDisplay();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
workBtn.addEventListener('click', () => setTimerMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => setTimerMode('shortBreak'));
longBreakBtn.addEventListener('click', () => setTimerMode('longBreak'));
addFiveBtn.addEventListener('click', addFiveMinutes);

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    requestNotificationPermission();
});

// Add a new function to update the title with current time
function updateTitleWithTime() {
    // Assuming you have minutes and seconds variables
    const minutesDisplay = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secondsDisplay = String(timeLeft % 60).padStart(2, '0');
    document.title = `(${minutesDisplay}:${secondsDisplay}) - Pomodoro Timer`;
} 