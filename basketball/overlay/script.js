import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC-Cq-XXAqWGkjAIS3DJoJ2Nfe47HbWKuw",
    authDomain: "football-a63c2.firebaseapp.com",
    projectId: "football-a63c2",
    storageBucket: "football-a63c2.firebasestorage.app",
    messagingSenderId: "730151392921",
    appId: "1:730151392921:web:959848e5ef9264278d8a08",
    databaseURL: "https://football-a63c2-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const teamAName = document.getElementById('team-a-name');
const teamAScore = document.getElementById('team-a-score');
const foulsAContainer = document.getElementById('fouls-a-container');
const teamBName = document.getElementById('team-b-name');
const teamBScore = document.getElementById('team-b-score');
const foulsBContainer = document.getElementById('fouls-b-container');
const timerDisplay = document.getElementById('timer-display');
const extraTimeDisplay = document.getElementById('extra-time-display');
const telethonBadge = document.getElementById('top-right-widget');

let timerInterval = null;
let remainingSeconds = 5400;
let isRunning = false;
let lastSyncTimestamp = 0;

function renderFouls(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        if (i < count) {
            const dot = document.createElement('div');
            dot.className = `foul-box ${i === 4 ? 'red' : 'yellow'}`;
            container.appendChild(dot);
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateLocalClock() {
    if (isRunning) {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - lastSyncTimestamp;
        const currentRemaining = Math.max(0, remainingSeconds - elapsed);
        timerDisplay.textContent = formatTime(currentRemaining);
    } else {
        timerDisplay.textContent = formatTime(remainingSeconds);
    }
}

onValue(ref(db, 'basketball'), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (data.teamA) {
        teamAName.textContent = data.teamA.name || 'Gendarmes';
        teamAScore.textContent = String(data.teamA.score ?? 0).padStart(2, '0');
        renderFouls(foulsAContainer, data.teamA.fouls ?? 0);
    }

    if (data.teamB) {
        teamBName.textContent = data.teamB.name || 'Pompiers';
        teamBScore.textContent = String(data.teamB.score ?? 0).padStart(2, '0');
        renderFouls(foulsBContainer, data.teamB.fouls ?? 0);
    }

    if (data.extraTime && data.extraTime > 0) {
        extraTimeDisplay.textContent = `+${data.extraTime}`;
    } else {
        extraTimeDisplay.textContent = '';
    }

    if (data.timer) {
        remainingSeconds = data.timer.secondsLeft ?? 5400;
        isRunning = data.timer.running ?? false;
        lastSyncTimestamp = data.timer.updatedAt ? Math.floor(data.timer.updatedAt / 1000) : Math.floor(Date.now() / 1000);

        clearInterval(timerInterval);
        updateLocalClock();
        if (isRunning) {
            timerInterval = setInterval(updateLocalClock, 1000);
        }
    }

    if (data.showTelethon !== undefined) {
        if (data.showTelethon) {
            telethonBadge.classList.remove('hidden');
        } else {
            telethonBadge.classList.add('hidden');
        }
    }
});