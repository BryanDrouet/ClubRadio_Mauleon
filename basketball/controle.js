/* global firebase, firebaseConfig */
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();
const matchRef = database.ref('basketball/match');
const displayRef = database.ref('basketball/display');
const allowedEmails = ['bryan.drouet24@gmail.com', 'clubradio.mauleon@gmail.com'];
const $ = (id) => document.getElementById(id);
const displayFields = ['homeName', 'homeScore', 'awayName', 'awayScore', 'homeFouls', 'awayFouls', 'homeTimeouts', 'awayTimeouts', 'sponsor', 'quarter'];
let state = { running: false, paused: false, remainingSeconds: 600, startedAt: 0 };

function number(id, fallback = 0) {
    return Math.max(0, Number($(id).value) || fallback);
}

function readDisplayForm() {
    return {
        homeName: $('homeName').value.trim() || 'Domicile',
        awayName: $('awayName').value.trim() || 'Extérieur',
        homeScore: number('homeScore'),
        awayScore: number('awayScore'),
        homeFouls: number('homeFouls'),
        awayFouls: number('awayFouls'),
        homeTimeouts: number('homeTimeouts'),
        awayTimeouts: number('awayTimeouts'),
        sponsor: $('sponsor').value.trim() || 'CLUBRADIO',
        quarter: Math.min(4, number('quarter', 1))
    };
}

function fillForm(data) {
    displayFields.forEach((id) => {
        if (data[id] !== undefined) $(id).value = data[id];
    });
}

function remainingSeconds() {
    if (!state.running) return Math.max(0, state.remainingSeconds);
    return Math.max(0, state.remainingSeconds - Math.floor((Date.now() - state.startedAt) / 1000));
}

function renderTimer() {
    const seconds = remainingSeconds();
    $('controlTimer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('timerState').textContent = state.running ? 'En direct' : state.paused ? 'En pause' : 'Arrêté';
}

function saveTimer(next) {
    state = { ...state, ...next };
    matchRef.update({ running: state.running, paused: state.paused, remainingSeconds: state.remainingSeconds, startedAt: state.startedAt });
    renderTimer();
}

auth.onAuthStateChanged((user) => {
    if (user && allowedEmails.includes(user.email)) {
        $('loginPanel').hidden = true;
        $('dashboard').hidden = false;
        $('userEmail').textContent = user.email;
        return;
    }
    $('loginPanel').hidden = false;
    $('dashboard').hidden = true;
    if (user) {
        $('loginError').textContent = 'Ce compte n’est pas autorisé à contrôler cet overlay.';
        $('loginError').hidden = false;
        auth.signOut();
    }
});

$('loginButton').addEventListener('click', async () => {
    $('loginButton').disabled = true;
    try {
        await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (error) {
        $('loginError').textContent = `Connexion impossible : ${error.message}`;
        $('loginError').hidden = false;
        $('loginButton').disabled = false;
    }
});
$('logoutButton').addEventListener('click', () => auth.signOut());
$('saveMatchButton').addEventListener('click', () => matchRef.update(readDisplayForm()));
$('saveDisplayButton').addEventListener('click', () => displayRef.update({ ...readDisplayForm(), visible: true }));
$('visibilityButton').addEventListener('click', async () => {
    const visible = $('visibilityButton').textContent.startsWith('Masquer');
    await displayRef.update({ visible });
    $('visibilityButton').textContent = visible ? 'Masquer l’overlay' : 'Afficher l’overlay';
});
$('swapButton').addEventListener('click', () => {
    ['Name', 'Score', 'Fouls', 'Timeouts'].forEach((field) => {
        const home = $(`home${field}`).value;
        $(`home${field}`).value = $(`away${field}`).value;
        $(`away${field}`).value = home;
    });
    matchRef.update(readDisplayForm());
});
$('startButton').addEventListener('click', () => saveTimer({ running: true, paused: false, startedAt: Date.now() }));
$('pauseButton').addEventListener('click', () => saveTimer({ running: false, paused: true, remainingSeconds: remainingSeconds(), startedAt: 0 }));
$('resetButton').addEventListener('click', () => saveTimer({ running: false, paused: false, remainingSeconds: number('periodMinutes', 10) * 60, startedAt: 0 }));
$('copyUrlButton').addEventListener('click', async () => {
    await navigator.clipboard.writeText($('overlayUrl').textContent);
    $('copyUrlButton').textContent = 'URL copiée';
    setTimeout(() => { $('copyUrlButton').textContent = 'Copier l’URL'; }, 1500);
});
matchRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    fillForm(data);
    state = { running: Boolean(data.running), paused: Boolean(data.paused), remainingSeconds: Number(data.remainingSeconds) || number('periodMinutes', 10) * 60, startedAt: Number(data.startedAt) || 0 };
    renderTimer();
});
displayRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    fillForm(data);
    $('visibilityButton').textContent = data.visible === false ? 'Afficher l’overlay' : 'Masquer l’overlay';
});
database.ref('.info/connected').on('value', (snapshot) => {
    $('connectionStatus').textContent = snapshot.val() ? 'Connecté' : 'Déconnecté';
});
setInterval(renderTimer, 1000);
$('overlayUrl').textContent = new URL('overlay.html', window.location.href).href;
