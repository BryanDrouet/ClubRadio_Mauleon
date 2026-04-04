document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('copyright').textContent =
        `© ${new Date().getFullYear()} Le ClubRadio Mauléon - Tous droits réservés`;
});
