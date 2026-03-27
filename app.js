document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('copyright').textContent =
        `\u00a9 ${new Date().getFullYear()} ClubRadio Mauléon - Tous droits réservés`;
});
