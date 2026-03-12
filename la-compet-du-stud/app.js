import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCLLF7RMMLm51_PZmwrDQxBnWrEBF1InRA",
    authDomain: "secondes-9c7df.firebaseapp.com",
    databaseURL: "https://secondes-9c7df-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "secondes-9c7df",
    storageBucket: "secondes-9c7df.firebasestorage.app",
    messagingSenderId: "51241088767",
    appId: "1:51241088767:web:7ea6725bdb206b50fdbeca"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const admins = ["bryan.drouet24@gmail.com", "clubradio.mauleon@gmail.com"];
let isAdmin = false;

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminPanel = document.getElementById('admin-panel');
const addBtn = document.getElementById('add-btn');
const newNameInput = document.getElementById('new-name');
const scoreboard = document.getElementById('scoreboard');

lucide.createIcons();

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        if (admins.includes(user.email)) {
            isAdmin = true;
            adminPanel.classList.remove('hidden');
        } else {
            isAdmin = false;
            adminPanel.classList.add('hidden');
        }
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        isAdmin = false;
        adminPanel.classList.add('hidden');
    }
    renderData(window.currentParticipants || []);
});

loginBtn.addEventListener('click', () => signInWithPopup(auth, provider));
logoutBtn.addEventListener('click', () => signOut(auth));

onSnapshot(collection(db, "participants"), (snapshot) => {
    const participants = [];
    snapshot.forEach((doc) => {
        participants.push({ id: doc.id, ...doc.data() });
    });
    participants.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'fr'));
    window.currentParticipants = participants;
    renderData(participants);
});

addBtn.addEventListener('click', async () => {
    const name = newNameInput.value.trim();
    if (name && isAdmin) {
        await addDoc(collection(db, "participants"), { name: name, score: 0 });
        newNameInput.value = '';
    }
});

function renderData(participants) {
    scoreboard.innerHTML = '';

    const uniqueScores = [...new Set(participants.map(p => p.score))].sort((a, b) => b - a);
    const rankOf = {};
    uniqueScores.forEach((score, i) => { rankOf[score] = i + 1; });

    participants.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        header.textContent = p.name;
        
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score';
        scoreDiv.textContent = p.score;

        const rank = rankOf[p.score];
        if (rank >= 1 && rank <= 4) card.classList.add(`rank-${rank}`);
        
        card.appendChild(header);
        card.appendChild(scoreDiv);

        if (isAdmin) {
            const controls = document.createElement('div');
            controls.className = 'controls';

            const groupPlus = document.createElement('div');
            groupPlus.className = 'btn-group';
            [1, 3, 5].forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'btn-plus';
                const icon = document.createElement('i');
                icon.setAttribute('data-lucide', 'plus');
                btn.appendChild(icon);
                btn.appendChild(document.createTextNode(' ' + val));
                btn.addEventListener('click', async () => {
                    await updateDoc(doc(db, "participants", p.id), { score: increment(val) });
                });
                groupPlus.appendChild(btn);
            });

            const groupMinus = document.createElement('div');
            groupMinus.className = 'btn-group';
            [-1, -3, -5].forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'btn-minus';
                const icon = document.createElement('i');
                icon.setAttribute('data-lucide', 'minus');
                btn.appendChild(icon);
                btn.appendChild(document.createTextNode(' ' + Math.abs(val)));
                btn.addEventListener('click', async () => {
                    await updateDoc(doc(db, "participants", p.id), { score: increment(val) });
                });
                groupMinus.appendChild(btn);
            });

            const groupDirect = document.createElement('div');
            groupDirect.className = 'btn-group score-direct';

            const scoreInput = document.createElement('input');
            scoreInput.type = 'number';
            scoreInput.className = 'score-input';
            scoreInput.value = p.score;
            scoreInput.placeholder = 'Score';

            const btnSet = document.createElement('button');
            btnSet.className = 'btn-set';
            const iconSet = document.createElement('i');
            iconSet.setAttribute('data-lucide', 'check');
            btnSet.appendChild(iconSet);
            btnSet.addEventListener('click', async () => {
                const val = parseInt(scoreInput.value, 10);
                if (!isNaN(val)) {
                    await updateDoc(doc(db, "participants", p.id), { score: val });
                }
            });

            const btnReset = document.createElement('button');
            btnReset.className = 'btn-reset';
            const iconReset = document.createElement('i');
            iconReset.setAttribute('data-lucide', 'rotate-ccw');
            btnReset.appendChild(iconReset);
            btnReset.addEventListener('click', async () => {
                await updateDoc(doc(db, "participants", p.id), { score: 0 });
            });

            groupDirect.appendChild(scoreInput);
            groupDirect.appendChild(btnSet);
            groupDirect.appendChild(btnReset);

            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-delete';
            const iconTrash = document.createElement('i');
            iconTrash.setAttribute('data-lucide', 'trash-2');
            btnDelete.appendChild(iconTrash);
            btnDelete.addEventListener('click', () => {
                openModal(p.name, async () => {
                    await deleteDoc(doc(db, "participants", p.id));
                });
            });

            controls.appendChild(groupPlus);
            controls.appendChild(groupMinus);
            controls.appendChild(groupDirect);
            controls.appendChild(btnDelete);
            card.appendChild(controls);
        }
        scoreboard.appendChild(card);
    });

    lucide.createIcons();
}

function openModal(name, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const msg = document.createElement('p');
    msg.textContent = `Supprimer ${name} ?`;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'modal-actions';

    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'btn-modal-confirm';
    const iconConfirm = document.createElement('i');
    iconConfirm.setAttribute('data-lucide', 'trash-2');
    btnConfirm.appendChild(iconConfirm);
    btnConfirm.appendChild(document.createTextNode(' Supprimer'));
    btnConfirm.addEventListener('click', async () => {
        overlay.remove();
        await onConfirm();
    });

    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn-modal-cancel';
    const iconCancel = document.createElement('i');
    iconCancel.setAttribute('data-lucide', 'x');
    btnCancel.appendChild(iconCancel);
    btnCancel.appendChild(document.createTextNode(' Annuler'));
    btnCancel.addEventListener('click', () => overlay.remove());

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    btnGroup.appendChild(btnConfirm);
    btnGroup.appendChild(btnCancel);
    modal.appendChild(msg);
    modal.appendChild(btnGroup);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    lucide.createIcons();
}
