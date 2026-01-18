let timerInterval;
let running = false;
let startTime, elapsedTime = 0;
let timerOnlyVisible = false;

let signetCount = 0;
const signetContainer = document.getElementById("bookmarksContainer");

function removeButtons() {
    const buttons = document.querySelectorAll(".buttons");
    buttons.forEach(button => {
        if (button.style.display === "none") {
            button.style.display = "flex";  // Afficher les boutons
        } else {
            button.style.display = "none";  // Masquer les boutons
        }
    });
}

function removeBookmarks() {
    const signets = document.querySelectorAll(".signet-item");
    signets.forEach(signet => {
        if (signet.style.display === "none") {
            signet.style.display = "block";  // Afficher les signets
        } else {
            signet.style.display = "none";  // Masquer les signets
        }
    });
}

function toggleSettings() {
    document.body.classList.toggle("menu-open");
}

function toggleFullScreen() {
    const fullscreenButton = document.getElementById("fullscreenButton");

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenButton.textContent = '✘'; // Change the icon to ✘ when fullscreen is active
        fullscreenButton.style.transform = "rotate(180deg)"; // Add rotation animation on text
    } else {
        document.exitFullscreen();
        fullscreenButton.textContent = '⛶'; // Change the icon back to ⛶ when exiting fullscreen
        fullscreenButton.style.transform = "rotate(0deg)";
    }
}

function toggleTimer() {
    const recButton = document.getElementById("recButton");
    const resetButton = document.getElementById("resetButton");
    const timer = document.getElementById("timer");
    const signetButton = document.getElementById("bookmarkButton"); // Le bouton Signet

    if (running) {
        clearInterval(timerInterval);
        elapsedTime += Date.now() - startTime;
        recButton.textContent = "REC";
        timer.classList.remove("timer-running");
    } else {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
        recButton.textContent = "STOP";
        timer.classList.add("timer-running");
    }
    running = !running;
    resetButton.disabled = false;

    // Activer/désactiver le bouton "Signet" en fonction de l'état du timer
    if (running) {
        signetButton.disabled = false;  // Activer le bouton quand le timer fonctionne
    } else {
        signetButton.disabled = true;   // Désactiver le bouton quand le timer ne fonctionne pas
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    document.getElementById("timer").textContent = "00:00:00:0";
    document.getElementById("recButton").textContent = "REC";
    running = false;
    document.getElementById("resetButton").disabled = true;
    document.getElementById("bookmarkButton").disabled = true;
}

function updateTimer() {
    const currentTime = elapsedTime + (Date.now() - startTime);
    const hours = String(Math.floor(currentTime / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((currentTime % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((currentTime % 60000) / 1000)).padStart(2, '0');
    const milliseconds = String(Math.floor((currentTime % 1000) / 100));

    document.getElementById("timer").textContent = `${hours}:${minutes}:${seconds}:${milliseconds}`;
}

function addSignet() {
    if (!running) {  // Ne pas ajouter de signet si le timer n'est pas lancé
        return;
    }

    signetCount++;

    const signetName = `Signet n°${signetCount}`;

    const currentTime = elapsedTime + (Date.now() - startTime);
    const hours = String(Math.floor(currentTime / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((currentTime % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((currentTime % 60000) / 1000)).padStart(2, '0');
    const milliseconds = String(Math.floor((currentTime % 1000) / 100));

    const timeDifference = `${hours}:${minutes}:${seconds}:${milliseconds}`;

    const signetDiv = document.createElement("div");
    signetDiv.className = "signet-item";

    const signetNameDiv = document.createElement("div");
    signetNameDiv.className = "signet-name";
    signetNameDiv.textContent = `${signetName} - ${timeDifference}`;
    signetDiv.appendChild(signetNameDiv);

    const renameButton = document.createElement("button");
    renameButton.className = "signet-rename-button";
    renameButton.textContent = "✎";
    renameButton.onclick = function() {
        renameSignet(signetNameDiv);  // Renommer le texte du signet
    };
    signetDiv.appendChild(renameButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "signet-delete-button";
    deleteButton.textContent = "❌";
    deleteButton.onclick = function() {
        deleteSignet(signetDiv);
    };
    signetDiv.appendChild(deleteButton);

    signetContainer.prepend(signetDiv);  // Ajouter en haut de la liste (le plus récent en haut)
}

function renameSignet(signetNameDiv) {
    const newName = prompt("Entrez un nouveau nom pour le signet:", signetNameDiv.textContent.split(" - ")[0]); // Ne modifier que la partie nom
    if (newName) {
        signetNameDiv.textContent = `${newName} - ${signetNameDiv.textContent.split(" - ")[1]}`;
    }
}

function deleteSignet(signetDiv) {
    signetDiv.classList.add("signet-deleted"); // Ajouter l'animation de suppression
    setTimeout(() => {
        signetContainer.removeChild(signetDiv); // Supprimer après l'animation
        signetCount--;
    }, 0);
}

function toggleBookmarksVisibility() {
    const signetList = document.getElementById("bookmarksContainer");

    if (signetList.style.display === "none" || signetList.style.display === "") {
        signetList.style.display = "block";  // Afficher les signets
    } else {
        signetList.style.display = "none";   // Cacher les signets
    }
}

function checkOverflow() {
    const container = document.getElementById("bookmarksContainer");

    // Vérifier si le contenu dépasse la hauteur du conteneur
    if (container.scrollHeight > container.clientHeight) {
        container.classList.add("overflow");
    } else {
        container.classList.remove("overflow");
    }
}

// Appeler la fonction checkOverflow à chaque changement de taille
window.addEventListener('resize', checkOverflow);

// Appeler à la première exécution de la page
checkOverflow();
