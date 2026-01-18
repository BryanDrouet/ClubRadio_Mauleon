/**
 * FICHIER DE CONFIGURATION GLOBAL - ClubRadio 24/7
 * ================================================
 * Ce fichier contient tous les paramètres modifiables du système.
 * Modifiez ces valeurs selon vos besoins sans toucher au code principal.
 */

const CONFIG = {
    // ========================================
    // GESTION DES PAUSES MUSICALES (INTERCALAIRES)
    // ========================================
    
    /**
     * Intervalle en MINUTES entre deux pauses musicales
     * Exemple: 20 = Une pause toutes les 20 minutes
     */
    musicIntervalMinutes: 20,
    
    /**
     * Seuil en pourcentage pour l'affichage du bandeau (valeur entre 0 et 1)
     * Si temps restant > (musicIntervalMinutes * musicThresholdPercent) :
     *   → Afficher "Prochaine pause musicale dans X minutes"
     * Sinon :
     *   → Afficher le titre de la prochaine vidéo/événement
     * 
     * Exemple: 0.3 = 30% du temps (6 minutes pour un intervalle de 20min)
     */
    musicThresholdPercent: 0.3,
    
    /**
     * Durée maximale d'une pause musicale en MINUTES
     * Si la pause dépasse ce temps, passer à la suite
     */
    maxMusicDurationMinutes: 5,
    
    /**
     * Mode de sélection des musiques: "random" ou "sequential"
     */
    musicSelectionMode: "random",
    
    
    // ========================================
    // GESTION DES ÉVÉNEMENTS PLANIFIÉS
    // ========================================
    
    /**
     * Comportement quand un événement planifié arrive pendant une vidéo:
     * - "wait": Attendre la fin de la vidéo en cours
     * - "fade": Faire un fondu et lancer l'événement immédiatement
     */
    scheduleInterruptMode: "wait",
    
    /**
     * Durée du fondu en millisecondes (si mode "fade" activé)
     */
    fadeDurationMs: 1500,
    
    /**
     * Tolérance en SECONDES pour déclencher un événement planifié
     * Si l'événement est prévu à 12:00:00 avec une tolérance de 30s,
     * il peut se déclencher entre 11:59:30 et 12:00:30
     */
    scheduleToleranceSeconds: 30,
    
    
    // ========================================
    // CHEMINS DES FICHIERS
    // ========================================
    
    /**
     * Préfixe pour les fichiers média (relatif à index.html)
     * Pour GitHub Pages, utilisez "./" ou "../assets/"
     */
    pathPrefix: "../assets/",
    
    /**
     * Chemin vers le fichier JSON de la playlist principale
     */
    playlistFile: "./playlist.json",
    
    /**
     * Chemin vers le fichier JSON des musiques (intercalaires)
     */
    musicFile: "./music.json",
    
    /**
     * Chemin vers le fichier JSON des événements planifiés
     */
    scheduleFile: "./schedule.json",
    
    
    // ========================================
    // GESTION DES ERREURS
    // ========================================
    
    /**
     * Temps d'attente maximum (en secondes) pour le chargement d'une vidéo
     * Si dépassé, passer à la vidéo suivante
     */
    videoLoadTimeoutSeconds: 15,
    
    /**
     * Nombre de tentatives avant de sauter définitivement une vidéo
     */
    maxRetryAttempts: 2,
    
    
    // ========================================
    // INTERFACE UTILISATEUR (BANDEAU)
    // ========================================
    
    /**
     * Vitesse du défilement du bandeau en pixels/seconde
     */
    tickerSpeed: 50,
    
    /**
     * Durée d'affichage des messages fixes en millisecondes
     */
    messageDisplayDuration: 5000,
    
    /**
     * Format de l'heure affichée
     * Exemples: "fr-FR" pour 14:30:00, "en-US" pour 2:30:00 PM
     */
    timeLocale: "fr-FR",
    
    /**
     * Options de formatage de l'heure
     */
    timeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    },
    
    
    // ========================================
    // YOUTUBE (OPTIONNEL)
    // ========================================
    
    /**
     * Activer le support YouTube IFrame API
     * Attention: Nécessite une connexion internet active
     */
    enableYouTube: true,
    
    /**
     * Clé API YouTube (optionnel, pour les vidéos privées)
     * Laissez vide pour les vidéos publiques
     */
    youtubeApiKey: "",
    
    
    // ========================================
    // PERFORMANCE ET OPTIMISATION
    // ========================================
    
    /**
     * Fréquence de mise à jour du bandeau en millisecondes
     * Plus petit = plus fluide mais plus de CPU
     */
    tickerUpdateInterval: 50,
    
    /**
     * Activer les logs de debug dans la console
     */
    debugMode: true,
    
    /**
     * Nettoyer les ressources vidéo après lecture
     * Recommandé pour éviter les fuites mémoire
     */
    cleanupVideosAfterPlay: true,
    
    
    // ========================================
    // PARAMÈTRES VISUELS
    // ========================================
    
    /**
     * Résolution du conteneur (pour OBS)
     */
    resolution: {
        width: 1920,
        height: 1080
    },
    
    /**
     * Couleur de fond de secours (en cas de chargement)
     */
    backgroundColor: "#000000",
    
    /**
     * Afficher un indicateur de chargement
     */
    showLoadingIndicator: true
};

// Export de la configuration (pour compatibilité future avec modules ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
