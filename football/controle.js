/* global firebase, firebaseConfig */
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();
const matchRef = database.ref('football/match');
const displayRef = database.ref('football/display');
const connectedRef = database.ref('.info/connected');
const allowedEmails = ['bryan.drouet24@gmail.com', 'clubradio.mauleon@gmail.com'];

const $ = (id) => document.getElementById(id);
const fields = ['homeName', 'homeScore', 'awayName', 'awayScore', 'homeYellow', 'homeRed', 'awayYellow', 'awayRed', 'sponsor'];
let state = { running: false, elapsed: 0, startedAt: 0 };
let timerInterval;

function readForm() {
    const number = (id) => Math.max(0, Number($(id).value) || 0);
    return {
        homeName: $('homeName').value.trim() || 'Domicile',
        awayName: $('awayName').value.trim() || 'Extérieur',
        homeScore: number('homeScore'),
        awayScore: number('awayScore'),
        homeYellow: number('homeYellow'),
        homeRed: number('homeRed'),
        awayYellow: number('awayYellow'),
        awayRed: number('awayRed'),
        sponsor: $('sponsor').value.trim() || 'TÉLÉTHON 3637'
    };
}

function fillForm(data) {
    fields.forEach((id) => {
        if (data[id] !== undefined) $(id).value = data[id];
    });
}

function elapsedSeconds() {
    if (!state.running) return state.elapsed || 0;
    return (state.elapsed || 0) + Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
}

function renderTimer() {
    const seconds = elapsedSeconds();
    $('controlTimer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('timerState').textContent = state.running ? 'En direct' : seconds ? 'En pause' : 'Arrêté';
}

function saveTimer(next) {
    state = { ...state, ...next };
    matchRef.update({ running: state.running, elapsed: state.elapsed, startedAt: state.startedAt, updatedAt: firebase.database.ServerValue.TIMESTAMP });
    renderTimer();
}

auth.onAuthStateChanged((user) => {
    if (user && allowedEmails.includes(user.email)) {
        $('loginPanel').hidden = true;
        $('dashboard').hidden = false;
        $('loginButton').disabled = false;
        $('userEmail').textContent = user.email;
        return;
    }
    $('loginPanel').hidden = false;
    $('dashboard').hidden = true;
    $('loginButton').disabled = false;
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
$('saveMatchButton').addEventListener('click', () => matchRef.update(readForm()));
$('saveDisplayButton').addEventListener('click', async () => {
    await displayRef.update({ ...readForm(), visible: true });
    $('visibilityButton').textContent = 'Masquer l’overlay';
});
$('visibilityButton').addEventListener('click', async () => {
    const visible = $('visibilityButton').textContent.startsWith('Masquer');
    await displayRef.update({ visible });
    $('visibilityButton').textContent = visible ? 'Masquer l’overlay' : 'Afficher l’overlay';
});
$('swapButton').addEventListener('click', () => {
    const home = { name: $('homeName').value, score: $('homeScore').value, yellow: $('homeYellow').value, red: $('homeRed').value };
    $('homeName').value = $('awayName').value;
    $('homeScore').value = $('awayScore').value;
    $('homeYellow').value = $('awayYellow').value;
    $('homeRed').value = $('awayRed').value;
    $('awayName').value = home.name;
    $('awayScore').value = home.score;
    $('awayYellow').value = home.yellow;
    $('awayRed').value = home.red;
    matchRef.update(readForm());
});
$('startButton').addEventListener('click', () => saveTimer({
    running: true,
    elapsed: Math.max(0, Number($('startMinute').value) || 0) * 60,
    startedAt: Date.now()
}));
$('pauseButton').addEventListener('click', () => saveTimer({ running: false, elapsed: elapsedSeconds(), startedAt: 0 }));
$('resetButton').addEventListener('click', () => saveTimer({ running: false, elapsed: 0, startedAt: 0 }));
$('copyUrlButton').addEventListener('click', async () => {
    await navigator.clipboard.writeText($('overlayUrl').textContent);
    $('copyUrlButton').textContent = 'URL copiée';
    setTimeout(() => { $('copyUrlButton').textContent = 'Copier l’URL'; }, 1500);
});

matchRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    fillForm(data);
    state = { running: Boolean(data.running), elapsed: Number(data.elapsed) || 0, startedAt: Number(data.startedAt) || 0 };
    renderTimer();
});
displayRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    fillForm(data);
    $('visibilityButton').textContent = data.visible === false ? 'Afficher l’overlay' : 'Masquer l’overlay';
});
connectedRef.on('value', (snapshot) => {
    $('connectionStatus').textContent = snapshot.val() ? 'Connecté' : 'Déconnecté';
});
timerInterval = setInterval(renderTimer, 1000);
$('overlayUrl').textContent = new URL('overlay.html', window.location.href).href;
