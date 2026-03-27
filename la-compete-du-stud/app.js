/**
 * SIMULATION DE FUSEAU HORAIRE (DEV MODE)
 * Pour simuler un fuseau horaire différent, ajoute le paramètre "?tz=" à l'URL
 * Exemples:
 *   - http://localhost:5500/la-compete-du-stud/?tz=UTC-4  (UTC-4, ex: New York)
 *   - http://localhost:5500/la-compete-du-stud/?tz=UTC+2  (UTC+2, ex: Paris)
 *   - http://localhost:5500/la-compete-du-stud/?tz=UTC-8  (UTC-8, ex: Los Angeles)
 * Un badge rouge apparaîtra en haut à droite pour confirmer la simulation.
 */

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
let globalPollData = { option1: 0, option2: 0 };
let currentUser = null;

// Simulation de fuseau horaire pour le dev
let simulatedTimezoneOffset = null;
const urlParams = new URLSearchParams(window.location.search);
const tzParam = urlParams.get('tz');
if (tzParam) {
    // Extraire le nombre du paramètre (ex: "UTC-4" -> -4, "UTC+2" -> 2)
    const match = tzParam.match(/UTC([+-])(\d+)/);
    if (match) {
        simulatedTimezoneOffset = parseInt(match[1] + match[2]) * 60 * 60 * 1000; // Convertir en ms
        console.log(`Dev mode: Simulating ${tzParam} (offset: ${simulatedTimezoneOffset / (60 * 60 * 1000)} hours)`);
    }
}

// Fonction pour convertir une date de Paris au fuseau horaire local
function convertParisToLocal(parisDateStr) {
    // Format: "jj-mm-yyyy_hh:mm:ss"
    try {
        const [date, time] = parisDateStr.split('_');
        const [day, month, year] = date.split('-');
        const [hours, minutes, seconds] = time.split(':');
        
        // Créer une date UTC basée sur les valeurs
        const dateUTC = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`);
        
        // Créer deux dates pour calculer les décalages
        const parisiannow = new Date();
        const utcNow = new Date(parisiannow.toLocaleString('en-US', { timeZone: 'UTC' }));
        const parisNow = new Date(parisiannow.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
        
        const parisOffset = parisNow.getTime() - utcNow.getTime();
        
        // La date donnée est en heure de Paris, la convertir en UTC puis en heure locale
        let dateInParis = new Date(dateUTC.getTime() - parisOffset);
        
        // Si un fuseau horaire est simulé en dev, le remplacer
        if (simulatedTimezoneOffset !== null) {
            dateInParis = new Date(dateUTC.getTime() + simulatedTimezoneOffset);
        }
        
        return dateInParis;
    } catch (e) {
        console.error('Erreur conversion date:', e);
        return null;
    }
}

// Fonction pour générer un ID de vote unique
function generateVoteId() {
    return 'vote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Protection anti-bot simple
const ANTI_BOT_DELAY_MS = 10000; // 10 secondes minimum entre votes
const lastVoteTime = {};

function canVoteAntiBot(email) {
    const now = Date.now();
    const lastTime = lastVoteTime[email] || 0;
    return (now - lastTime) >= ANTI_BOT_DELAY_MS;
}

function recordVoteTime(email) {
    lastVoteTime[email] = Date.now();
}

// Fonction pour tracker si l'utilisateur a voté
function recordUserVote(email) {
    const votes = JSON.parse(localStorage.getItem('userPollVotes') || '{}');
    votes[email] = Date.now();
    localStorage.setItem('userPollVotes', JSON.stringify(votes));
}

function hasUserVoted(email) {
    const votes = JSON.parse(localStorage.getItem('userPollVotes') || '{}');
    return votes.hasOwnProperty(email);
}

// Fonction pour formater une date de manière lisible
function formatDateLocal(date) {
    if (!date) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);
}

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminPanel = document.getElementById('admin-panel');
const addBtn = document.getElementById('add-btn');
const newNameInput = document.getElementById('new-name');
const scoreboard = document.getElementById('scoreboard');

lucide.createIcons();

// Afficher le badge de fuseau horaire simulé en dev
if (simulatedTimezoneOffset !== null) {
    const header = document.querySelector('header');
    const badge = document.createElement('div');
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.padding = '8px 12px';
    badge.style.backgroundColor = '#ff6b6b';
    badge.style.color = 'white';
    badge.style.borderRadius = '4px';
    badge.style.fontSize = '0.85rem';
    badge.style.fontWeight = 'bold';
    badge.style.zIndex = '9999';
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    badge.textContent = `🔧 DEV: ${tzParam}`;
    document.body.appendChild(badge);
}

document.getElementById('poll-btn').addEventListener('click', openPollModal);
document.getElementById('info-btn').addEventListener('click', openRulesModal);

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
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
        currentUser = null;
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
            scoreInput.id = `score-input-${p.id}`;
            scoreInput.name = `score-input-${p.id}`;
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

function openPollModal() {
    fetch('poll.json?v=' + Date.now())
        .then(r => r.json())
        .then(pollConfig => {
            const now = new Date();
            const closeTime = convertParisToLocal(pollConfig.closeParisTz);
            const isOpen = now < closeTime;
            // Vérifier si l'utilisateur a déjà voté
            const userEmail = currentUser?.email || null;
            const hasVoted = userEmail ? hasUserVoted(userEmail) : false;

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            const modal = document.createElement('div');
            modal.className = 'modal';

            // HEADER
            const header = document.createElement('div');
            header.className = 'modal-header';
            
            // Wrapper pour le titre et le sous-titre (responsive)
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'modal-header-title-wrapper';
            titleWrapper.style.display = 'flex';
            titleWrapper.style.flexDirection = 'column';
            titleWrapper.style.gap = '10px';
            
            const title = document.createElement('h2');
            const iconTitle = document.createElement('i');
            iconTitle.setAttribute('data-lucide', 'bar-chart-2');
            title.appendChild(iconTitle);
            
            let titleText;
            if (isOpen) {
                titleText = 'Sondage - En cours';
            } else {
                let dateStr = formatDateLocal(closeTime);
                // Remplacer " HH:MM:SS" par " à HH:MM" (le " à " avant l'heure, sans les secondes)
                dateStr = dateStr.replace(/ (\d{2}):(\d{2}):\d{2}$/, ' à $1:$2');
                titleText = `Sondage - Fermé le ${dateStr}`;
            }
            title.appendChild(document.createTextNode(titleText));
            titleWrapper.appendChild(title);
            
            // Ajouter l'heure de fin pour les sondages en cours
            if (isOpen) {
                const closeInfo = document.createElement('p');
                closeInfo.style.fontSize = '0.85rem';
                closeInfo.style.color = 'var(--text-muted)';
                closeInfo.style.margin = '0';
                let dateStr = formatDateLocal(closeTime);
                dateStr = dateStr.replace(/ (\d{2}):(\d{2}):\d{2}$/, ' à $1:$2');
                closeInfo.textContent = `Se termine le ${dateStr}`;
                titleWrapper.appendChild(closeInfo);
            }
            
            header.appendChild(titleWrapper);
            
            const btnClose = document.createElement('button');
            btnClose.className = 'btn-modal-close';
            const iconClose = document.createElement('i');
            iconClose.setAttribute('data-lucide', 'x');
            btnClose.appendChild(iconClose);
            btnClose.addEventListener('click', () => overlay.remove());
            header.appendChild(btnClose);
            modal.appendChild(header);

            // BODY
            const body = document.createElement('div');
            body.className = 'modal-body';


            // Bloc question + actualisation
            const questionBlock = document.createElement('div');
            questionBlock.className = 'poll-question-block';

            const question = document.createElement('p');
            question.textContent = pollConfig.question || 'Quel est votre choix ?';
            questionBlock.appendChild(question);

            if (pollConfig.lastUpdateTime) {
                const updateTimeDiv = document.createElement('div');
                updateTimeDiv.className = 'poll-last-update';
                const updateTime = convertParisToLocal(pollConfig.lastUpdateTime);
                const updateTimeStr = formatDateLocal(updateTime).replace(/ (\d{2}):(\d{2}):(\d{2})$/, ' à $1:$2');
                updateTimeDiv.textContent = `Dernière actualisation : ${updateTimeStr}`;
                questionBlock.appendChild(updateTimeDiv);
            }
            body.appendChild(questionBlock);

            showPollResults(body, pollConfig, currentUser && isAdmin, isOpen, hasVoted);
            modal.appendChild(body);

            // FOOTER
            const footer = document.createElement('div');
            footer.className = 'modal-footer';

            const pollType = pollConfig.type || 'social-media'; // Par défaut: réseaux sociaux
            const isSocialMediaPoll = pollType === 'social-media';
            const isWebsitePoll = pollType === 'website';

            if (isOpen && isSocialMediaPoll) {
                // Sondage réseaux sociaux - Pas de vote en ligne
                const msg = document.createElement('p');
                msg.style.fontSize = '0.9rem';
                msg.style.margin = '0';
                msg.style.color = 'var(--text-muted)';
                msg.textContent = 'Votez via Discord, Instagram ou WhatsApp';
                footer.appendChild(msg);
            } else if (isOpen && isWebsitePoll && currentUser && !hasVoted) {
                // Sondage site - Accès pour voter si connecté
                const votingSection = document.createElement('div');
                votingSection.className = 'poll-voting';

                const btn1 = document.createElement('button');
                btn1.className = 'poll-vote-btn poll-vote-1';
                btn1.innerHTML = '<span class="poll-vote-number">1</span>';
                btn1.addEventListener('click', () => {
                    recordVoteTime(currentUser.email);
                    recordUserVote(currentUser.email);
                    overlay.remove();
                    alert('Vote enregistré !');
                });
                votingSection.appendChild(btn1);

                const btn2 = document.createElement('button');
                btn2.className = 'poll-vote-btn poll-vote-2';
                btn2.innerHTML = '<span class="poll-vote-number">2</span>';
                btn2.addEventListener('click', () => {
                    recordVoteTime(currentUser.email);
                    recordUserVote(currentUser.email);
                    overlay.remove();
                    alert('Vote enregistré !');
                });
                votingSection.appendChild(btn2);
                footer.appendChild(votingSection);
            } else if (isOpen && isWebsitePoll && !currentUser) {
                // Sondage site - Pas connecté
                const msg = document.createElement('p');
                msg.style.fontSize = '0.9rem';
                msg.style.margin = '0';
                msg.style.color = 'var(--text-muted)';
                msg.textContent = 'Connectez-vous pour participer';
                footer.appendChild(msg);
            }

            modal.appendChild(footer);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            lucide.createIcons();
        })
        .catch(err => console.error('Erreur chargement poll.json:', err));
}

function showPollResults(bodyElement, pollConfig, isAdminView = false, isOpen = true, hasVoted = false) {
    // Déterminer si on doit afficher les résultats
    const pollType = pollConfig.type || 'social-media';
    const isWebsitePoll = pollType === 'website';
    
    // Les résultats ne s'affichent que si :
    // 1. Le sondage est fermé (tous peuvent voir), OU
    // 2. C'est un sondage website ET l'utilisateur a voté, OU
    // 3. C'est un admin
    const shouldShowResults = !isOpen || isAdminView || (isWebsitePoll && hasVoted);
    
    // Message si les résultats ne sont pas disponibles
    if (!shouldShowResults && pollConfig.votes && Array.isArray(pollConfig.votes) && pollConfig.votes.length > 0) {
        // Bloc harmonisé pour message verrouillé
        const lockedBlock = document.createElement('div');
        lockedBlock.className = 'poll-results-locked-block';

        const lockedDiv = document.createElement('div');
        lockedDiv.className = 'poll-results-locked';
        const lockIcon = document.createElement('i');
        lockIcon.setAttribute('data-lucide', 'lock');
        lockedDiv.appendChild(lockIcon);
        lockedDiv.appendChild(document.createTextNode('Les résultats seront affichés à la fin du sondage'));
        lockedBlock.appendChild(lockedDiv);
        bodyElement.appendChild(lockedBlock);
        lucide.createIcons();
        return;
    }
    
    // Afficher la section des résultats filtrés par source
    if (pollConfig.votes && Array.isArray(pollConfig.votes) && pollConfig.votes.length > 0) {
        // Grouper les votes par source
        const resultsBySource = {};
        pollConfig.votes.forEach(vote => {
            const source = vote.source || 'Site';
            if (!resultsBySource[source]) {
                resultsBySource[source] = { option1: 0, option2: 0 };
            }
            if (vote.choice === 1) {
                resultsBySource[source].option1++;
            } else if (vote.choice === 2) {
                resultsBySource[source].option2++;
            }
        });

        const resultsBlock = document.createElement('div');
        resultsBlock.className = 'poll-results-block';

        // Titre avec label "Filtrer par source"
        const sourceTitle = document.createElement('p');
        sourceTitle.className = 'poll-results-title';
        sourceTitle.textContent = 'Filtrer par source';
        resultsBlock.appendChild(sourceTitle);

        // Conteneur des checkboxes
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'poll-results-filters';

        const sources = Object.keys(resultsBySource).sort();
        const checkedSources = new Set(sources); // Tous cochés par défaut

        sources.forEach(source => {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;

            const checkboxApple = document.createElement('div');
            checkboxApple.className = 'checkbox-apple';

            const label = document.createElement('span');
            label.className = 'checkbox-label';
            label.textContent = source;

            // Événement click sur le wrapper pour toggle le checkbox
            wrapper.addEventListener('click', (e) => {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    checkedSources.add(source);
                } else {
                    checkedSources.delete(source);
                }
                updateSourceResults();
            });

            wrapper.appendChild(checkbox);
            wrapper.appendChild(checkboxApple);
            wrapper.appendChild(label);
            checkboxContainer.appendChild(wrapper);
        });

        resultsBlock.appendChild(checkboxContainer);

        // Conteneur des résultats filtrés
        const filteredResultsDiv = document.createElement('div');
        filteredResultsDiv.className = 'poll-results';
        resultsBlock.appendChild(filteredResultsDiv);

        function updateSourceResults() {
            let filteredOption1 = 0;
            let filteredOption2 = 0;

            checkedSources.forEach(source => {
                filteredOption1 += resultsBySource[source].option1;
                filteredOption2 += resultsBySource[source].option2;
            });

            const filteredTotal = filteredOption1 + filteredOption2 || 1;
            const filteredPercent1 = Math.round((filteredOption1 / filteredTotal) * 100);
            const filteredPercent2 = Math.round((filteredOption2 / filteredTotal) * 100);

            // Chercher ou créer les éléments de résultat
            let result1Filtered = filteredResultsDiv.querySelector('.poll-result-item:nth-child(1)');
            let result2Filtered = filteredResultsDiv.querySelector('.poll-result-item:nth-child(2)');

            if (!result1Filtered) {
                // Créer les éléments s'ils n'existent pas
                result1Filtered = document.createElement('div');
                result1Filtered.className = 'poll-result-item';
                result1Filtered.innerHTML = `
                    <div class="poll-result-header">
                        <span class="poll-result-label">Option 1</span>
                        <span class="poll-result-count"></span>
                    </div>
                    <div class="poll-result-bar">
                        <div class="poll-result-fill" style="width: 0%"></div>
                    </div>
                    <div class="poll-result-percent"></div>
                `;
                filteredResultsDiv.appendChild(result1Filtered);
            }

            if (!result2Filtered) {
                result2Filtered = document.createElement('div');
                result2Filtered.className = 'poll-result-item';
                result2Filtered.innerHTML = `
                    <div class="poll-result-header">
                        <span class="poll-result-label">Option 2</span>
                        <span class="poll-result-count"></span>
                    </div>
                    <div class="poll-result-bar">
                        <div class="poll-result-fill" style="width: 0%"></div>
                    </div>
                    <div class="poll-result-percent"></div>
                `;
                filteredResultsDiv.appendChild(result2Filtered);
            }

            // Mettre à jour les valeurs avec animation
            const count1 = result1Filtered.querySelector('.poll-result-count');
            const count2 = result2Filtered.querySelector('.poll-result-count');
            const percent1 = result1Filtered.querySelector('.poll-result-percent');
            const percent2 = result2Filtered.querySelector('.poll-result-percent');
            const fill1 = result1Filtered.querySelector('.poll-result-fill');
            const fill2 = result2Filtered.querySelector('.poll-result-fill');

            count1.textContent = `${filteredOption1} vote${filteredOption1 > 1 ? 's' : ''}`;
            count2.textContent = `${filteredOption2} vote${filteredOption2 > 1 ? 's' : ''}`;
            percent1.textContent = `${filteredPercent1}%`;
            percent2.textContent = `${filteredPercent2}%`;

            // Trigger animation de la barre
            requestAnimationFrame(() => {
                fill1.style.width = `${filteredPercent1}%`;
                fill2.style.width = `${filteredPercent2}%`;
            });
        }

        updateSourceResults();
        bodyElement.appendChild(resultsBlock);
    }
    
    // Afficher les votes détaillés seulement pour les admins (si la liste n'est pas vide)
    if (isAdminView && pollConfig.votes && Array.isArray(pollConfig.votes) && pollConfig.votes.length > 0) {
        const adminBlock = document.createElement('div');
        adminBlock.className = 'poll-votes-admin-block';

        const adminTitle = document.createElement('div');
        adminTitle.className = 'poll-votes-admin-title';
        const adminIcon = document.createElement('i');
        adminIcon.setAttribute('data-lucide', 'list');
        adminTitle.appendChild(adminIcon);
        const adminLabel = document.createElement('span');
        adminLabel.textContent = 'Votes (Admin)';
        adminTitle.appendChild(adminLabel);
        adminBlock.appendChild(adminTitle);

        const votesContainer = document.createElement('div');
        votesContainer.className = 'poll-votes-admin-list';
        pollConfig.votes.forEach((vote) => {
            const voteItem = document.createElement('div');
            voteItem.textContent = `${vote.pseudo || 'Anonyme'} (${vote.source || 'Site'}) → Choix ${vote.choice}`;
            votesContainer.appendChild(voteItem);
        });
        adminBlock.appendChild(votesContainer);
        bodyElement.appendChild(adminBlock);
    }
}

async function openRulesModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    // HEADER
    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('h2');
    const iconTitle = document.createElement('i');
    iconTitle.setAttribute('data-lucide', 'info');
    title.appendChild(iconTitle);
    title.appendChild(document.createTextNode('Règles du jeu'));
    header.appendChild(title);

    const btnClose = document.createElement('button');
    btnClose.className = 'btn-modal-close';
    const iconClose = document.createElement('i');
    iconClose.setAttribute('data-lucide', 'x');
    btnClose.appendChild(iconClose);
    btnClose.addEventListener('click', () => overlay.remove());
    header.appendChild(btnClose);
    modal.appendChild(header);

    // BODY
    const body = document.createElement('div');
    body.className = 'modal-body';

    try {
        const response = await fetch('rules.md?v=' + Date.now());
        const text = await response.text();
        body.innerHTML = marked.parse(text);
        // Si le premier enfant est un h1, on ajoute la classe only-h1
        if (body.firstElementChild && body.firstElementChild.tagName === 'H1') {
            body.classList.add('only-h1');
        }
    } catch {
        body.innerHTML = '<p>Impossible de charger les règles.</p>';
    }

    modal.appendChild(body);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    lucide.createIcons();
}
