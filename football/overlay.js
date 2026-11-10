/* global firebase, firebaseConfig */
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const matchRef = database.ref('football/match');
const displayRef = database.ref('football/display');
const $ = (id) => document.getElementById(id);
let match = { running: false, elapsed: 0, startedAt: 0 };

function elapsedSeconds() {
    if (!match.running) return match.elapsed || 0;
    return (match.elapsed || 0) + Math.max(0, Math.floor((Date.now() - match.startedAt) / 1000));
}

function renderCards(target, yellow, red) {
    $(target).replaceChildren();
    for (let index = 0; index < (yellow || 0); index += 1) {
        const card = document.createElement('span');
        card.className = 'card-yellow';
        card.setAttribute('aria-label', 'carton jaune');
        $(target).appendChild(card);
    }
    for (let index = 0; index < (red || 0); index += 1) {
        const card = document.createElement('span');
        card.className = 'card-red';
        card.setAttribute('aria-label', 'carton rouge');
        $(target).appendChild(card);
    }
}

function renderTimer() {
    const seconds = elapsedSeconds();
    $('matchTimer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderDisplay(data) {
    $('footballOverlay').hidden = data.visible === false;
    ['homeName', 'homeScore', 'awayName', 'awayScore', 'sponsor'].forEach((id) => {
        if (data[id] !== undefined) $(id).textContent = data[id];
    });
    renderCards('homeCards', Number(data.homeYellow), Number(data.homeRed));
    renderCards('awayCards', Number(data.awayYellow), Number(data.awayRed));
}

matchRef.on('value', (snapshot) => {
    match = { ...match, ...(snapshot.val() || {}) };
    renderTimer();
});
displayRef.on('value', (snapshot) => renderDisplay(snapshot.val() || {}));
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() !== true) $('overlayError').hidden = false;
    else $('overlayError').hidden = true;
});
setInterval(renderTimer, 1000);
