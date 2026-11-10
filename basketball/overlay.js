/* global firebase, firebaseConfig */
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const matchRef = database.ref('basketball/match');
const displayRef = database.ref('basketball/display');
const $ = (id) => document.getElementById(id);
let match = { running: false, remainingSeconds: 600, startedAt: 0 };

function remainingSeconds() {
    if (!match.running) return Math.max(0, Number(match.remainingSeconds) || 0);
    return Math.max(0, (Number(match.remainingSeconds) || 0) - Math.floor((Date.now() - match.startedAt) / 1000));
}

function renderTimer() {
    const seconds = remainingSeconds();
    $('matchTimer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderDisplay(data) {
    $('basketballOverlay').hidden = data.visible === false;
    ['homeName', 'homeScore', 'awayName', 'awayScore', 'homeFouls', 'awayFouls', 'homeTimeouts', 'awayTimeouts', 'sponsor'].forEach((id) => {
        if (data[id] !== undefined) $(id).textContent = data[id];
    });
    if (data.quarter !== undefined) $('matchPeriod').textContent = `Q${data.quarter}`;
}

matchRef.on('value', (snapshot) => {
    match = { ...match, ...(snapshot.val() || {}) };
    renderTimer();
});
displayRef.on('value', (snapshot) => renderDisplay(snapshot.val() || {}));
database.ref('.info/connected').on('value', (snapshot) => {
    $('overlayError').hidden = snapshot.val() === true;
});
setInterval(renderTimer, 1000);
