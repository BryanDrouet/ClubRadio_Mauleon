let timerInterval;
let running = false;
let startTime, elapsedTime = 0;

let signetCount = 0;
const signetContainer = document.getElementById("bookmarksContainer");

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('menuToggle').addEventListener('click', toggleSettings);
    document.getElementById('fullscreenButton').addEventListener('click', toggleFullScreen);
    document.getElementById('recButton').addEventListener('click', toggleTimer);
    document.getElementById('resetButton').addEventListener('click', resetTimer);
    document.getElementById('bookmarkButton').addEventListener('click', addSignet);
    document.getElementById('removeButtons').addEventListener('click', removeButtons);
    document.getElementById('removeBookmarks').addEventListener('click', removeBookmarks);
    window.addEventListener('resize', checkOverflow);
    checkOverflow();
});

function removeButtons() {
    const buttons = document.querySelectorAll(".buttons");
    buttons.forEach(button => {
        if (button.style.display === "none") {
            button.style.display = "flex";
        } else {
            button.style.display = "none";
        }
    });
}

function removeBookmarks() {
    const signets = document.querySelectorAll(".signet-item");
    signets.forEach(signet => {
        if (signet.style.display === "none") {
            signet.style.display = "block";
        } else {
            signet.style.display = "none";
        }
    });
}

function toggleSettings() {
    document.body.classList.toggle("menu-open");
}

function toggleFullScreen() {
    const btn = document.getElementById("fullscreenButton");
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        btn.innerHTML = '<i data-lucide="minimize"></i>';
    } else {
        document.exitFullscreen();
        btn.innerHTML = '<i data-lucide="maximize"></i>';
    }
    lucide.createIcons();
}

function toggleTimer() {
    const recButton = document.getElementById("recButton");
    const resetButton = document.getElementById("resetButton");
    const timer = document.getElementById("timer");
    const signetButton = document.getElementById("bookmarkButton");

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
    signetButton.disabled = !running;
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
    if (!running) {
        return;
    }

    signetCount++;
    const signetName = `Signet n\u00b0${signetCount}`;

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
    const renameIcon = document.createElement("i");
    renameIcon.setAttribute("data-lucide", "pencil");
    renameButton.appendChild(renameIcon);
    renameButton.addEventListener('click', () => renameSignet(signetNameDiv));
    signetDiv.appendChild(renameButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "signet-delete-button";
    const deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("data-lucide", "x");
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => deleteSignet(signetDiv));
    signetDiv.appendChild(deleteButton);

    signetContainer.prepend(signetDiv);
    lucide.createIcons();
}

function renameSignet(signetNameDiv) {
    const newName = prompt("Entrez un nouveau nom pour le signet:", signetNameDiv.textContent.split(" - ")[0]);
    if (newName) {
        signetNameDiv.textContent = `${newName} - ${signetNameDiv.textContent.split(" - ")[1]}`;
    }
}

function deleteSignet(signetDiv) {
    signetDiv.classList.add("signet-deleted");
    setTimeout(() => {
        signetContainer.removeChild(signetDiv);
        signetCount--;
    }, 0);
}

function checkOverflow() {
    const container = document.getElementById("bookmarksContainer");
    if (container.scrollHeight > container.clientHeight) {
        container.classList.add("overflow");
    } else {
        container.classList.remove("overflow");
    }
}
