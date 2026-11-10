import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const auth = getAuth(app);

const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const controlTimerDisplay = document.getElementById('control-timer-display');
const btnTimerToggle = document.getElementById('btn-timer-toggle');
const inputTeamAName = document.getElementById('input-team-a-name');
const inputTeamBName = document.getElementById('input-team-b-name');
const displayFoulsA = document.getElementById('display-fouls-a');
const displayFoulsB = document.getElementById('display-fouls-b');

let currentState = {
    teamA: { name: "GENDARMES", score: 0, fouls: 0 },
    teamB: { name: "POMPIERS", score: 0, fouls: 0 },
    extraTime: 0,
    timer: { secondsLeft: 5400, running: false, updatedAt: Date.now() },
    showTelethon: true
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        btnLogin.classList.add('hidden');
        btnLogout.classList.remove('hidden');
    } else {
        btnLogin.classList.remove('hidden');
        btnLogout.classList.add('hidden');
    }
});

btnLogin.addEventListener('click', () => signInWithPopup(auth, new GoogleAuthProvider()));
btnLogout.addEventListener('click', () => signOut(auth));

onValue(ref(db, 'basketball'), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    currentState = data;

    if (data.teamA) {
        if (document.activeElement !== inputTeamAName) inputTeamAName.value = data.teamA.name || '';
        displayFoulsA.textContent = data.teamA.fouls ?? 0;
    }
    if (data.teamB) {
        if (document.activeElement !== inputTeamBName) inputTeamBName.value = data.teamB.name || '';
        displayFoulsB.textContent = data.teamB.fouls ?? 0;
    }

    if (data.extraTime !== undefined) {
        document.getElementById('input-extra-time').value = data.extraTime;
    }

    if (data.timer) {
        const mins = Math.floor(data.timer.secondsLeft / 60);
        const secs = data.timer.secondsLeft % 60;
        controlTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (data.timer.running) {
            btnTimerToggle.className = 'btn btn-massive btn-pause';
            btnTimerToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause';
        } else {
            btnTimerToggle.className = 'btn btn-massive btn-play';
            btnTimerToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="5 3 19 12 5 21 5 3"/></svg> Lancer';
        }
    }

    if (data.showTelethon !== undefined) {
        document.getElementById('input-show-telethon').checked = data.showTelethon;
    }
});

document.querySelectorAll('.btn-point, .btn-sub').forEach(btn => {
    btn.addEventListener('click', () => {
        const team = btn.dataset.team;
        const delta = parseInt(btn.dataset.delta, 10);
        const currentScore = currentState[`team${team}`]?.score || 0;
        update(ref(db, `basketball/team${team}`), { score: Math.max(0, currentScore + delta) });
    });
});

inputTeamAName.addEventListener('change', (e) => update(ref(db, 'basketball/teamA'), { name: e.target.value.toUpperCase() }));
inputTeamBName.addEventListener('change', (e) => update(ref(db, 'basketball/teamB'), { name: e.target.value.toUpperCase() }));

document.getElementById('btn-foul-a').addEventListener('click', () => {
    const fouls = currentState.teamA?.fouls || 0;
    update(ref(db, 'basketball/teamA'), { fouls: Math.min(5, fouls + 1) });
});
document.getElementById('btn-reset-foul-a').addEventListener('click', () => update(ref(db, 'basketball/teamA'), { fouls: 0 }));

document.getElementById('btn-foul-b').addEventListener('click', () => {
    const fouls = currentState.teamB?.fouls || 0;
    update(ref(db, 'basketball/teamB'), { fouls: Math.min(5, fouls + 1) });
});
document.getElementById('btn-reset-foul-b').addEventListener('click', () => update(ref(db, 'basketball/teamB'), { fouls: 0 }));

btnTimerToggle.addEventListener('click', () => {
    const isRunning = !(currentState.timer?.running || false);
    update(ref(db, 'basketball/timer'), { running: isRunning, updatedAt: Date.now() });
});

document.getElementById('btn-timer-set').addEventListener('click', () => {
    const mins = parseInt(document.getElementById('input-custom-minutes').value || '0', 10);
    const secs = parseInt(document.getElementById('input-custom-seconds').value || '0', 10);
    const extra = parseInt(document.getElementById('input-extra-time').value || '0', 10);
    
    update(ref(db, 'basketball'), { extraTime: extra });
    update(ref(db, 'basketball/timer'), {
        secondsLeft: (mins * 60) + secs,
        running: false,
        updatedAt: Date.now()
    });
});

document.getElementById('input-show-telethon').addEventListener('change', (e) => {
    update(ref(db, 'basketball'), { showTelethon: e.target.checked });
});

document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('Voulez-vous vraiment réinitialiser tout le match ?')) {
        set(ref(db, 'basketball'), {
            teamA: { name: "GENDARMES", score: 0, fouls: 0 },
            teamB: { name: "POMPIERS", score: 0, fouls: 0 },
            extraTime: 0,
            timer: { secondsLeft: 5400, running: false, updatedAt: Date.now() },
            showTelethon: true
        });
    }
});