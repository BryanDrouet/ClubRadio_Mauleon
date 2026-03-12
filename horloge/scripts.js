moment.locale('fr');

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");

function updateClock() {
    timeEl.innerText = moment().format('HH:mm:ss');
    dateEl.innerText = moment().format('dddd D MMMM YYYY');
}

setInterval(updateClock, 1000);
updateClock();
