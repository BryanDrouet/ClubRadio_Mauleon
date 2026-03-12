document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('copyright').textContent =
        `\u00a9 ${new Date().getFullYear()} Club Radio Mauléon - Tous droits réservés`;
});
