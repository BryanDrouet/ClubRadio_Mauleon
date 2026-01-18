/**
 * ============================================================================
 * APP.JS - ClubRadio 24/7 - Système de Gestion d'Overlay OBS
 * ============================================================================
 * 
 * Ce fichier contient toute la logique métier du système d'affichage dynamique.
 * Il gère:
 * - La lecture des vidéos de la playlist
 * - L'insertion de pauses musicales à intervalles réguliers
 * - La planification d'événements à heures fixes
 * - L'affichage intelligent du bandeau d'information
 * - La gestion des erreurs et du fallback
 * 
 * Architecture: Vanilla JavaScript (pas de framework)
 * Performance: Optimisé pour tourner 24h/24 sans fuite mémoire
 * 
 * ============================================================================
 */

// ============================================================================
// VARIABLES GLOBALES ET ÉTAT DE L'APPLICATION
// ============================================================================

const APP_STATE = {
    // Données chargées depuis les JSON
    playlist: [],
    musicTracks: [],
    scheduledEvents: [],
    
    // Index de lecture
    currentVideoIndex: 0,
    currentMusicIndex: 0,
    
    // Timers et intervalles
    musicIntervalTimer: null,
    scheduleCheckInterval: null,
    tickerUpdateInterval: null,
    clockUpdateInterval: null,
    videoLoadingTimeout: null,
    
    // État de la lecture
    isPlayingMusic: false,
    isPlayingScheduledEvent: false,
    currentMediaType: 'video', // 'video', 'music', 'schedule'
    currentMediaTitle: '',
    
    // Gestion du temps pour les pauses musicales
    lastMusicBreakTime: Date.now(),
    nextMusicBreakTime: null,
    
    // Gestion des erreurs
    videoRetryCount: 0,
    failedVideos: new Set(),
    
    // YouTube Player (si activé)
    youtubePlayer: null,
    youtubeReady: false,
    
    // État du bandeau
    tickerMode: 'scroll', // 'scroll' ou 'fixed'
};

// ============================================================================
// ÉLÉMENTS DOM (Références)
// ============================================================================

const DOM = {
    mainVideo: null,
    musicPlayer: null,
    youtubeContainer: null,
    loadingIndicator: null,
    errorIndicator: null,
    tickerBar: null,
    tickerContent: null,
    tickerMessage: null,
    clock: null,
    currentTime: null,
    nowPlaying: null,
    currentTitle: null,
    musicIndicator: null,
};

// ============================================================================
// INITIALISATION DE L'APPLICATION
// ============================================================================

/**
 * Point d'entrée principal de l'application
 * Appelé automatiquement au chargement de la page
 */
async function initializeApp() {
    log('🚀 Initialisation de ClubRadio 24/7...');
    
    try {
        // 1. Récupérer les références DOM
        cacheDOMElements();
        
        // 2. Charger les fichiers JSON de configuration
        await loadDataFiles();
        
        // 3. Calculer le prochain temps de pause musicale
        calculateNextMusicBreak();
        
        // 4. Démarrer les timers et intervalles
        startIntervals();
        
        // 5. Configurer les écouteurs d'événements
        setupEventListeners();
        
        // 6. Démarrer la lecture de la première vidéo
        playNextVideo();
        
        log('✅ Application initialisée avec succès');
        
    } catch (error) {
        logError('❌ Erreur fatale lors de l\'initialisation', error);
        showError('Erreur de chargement du système');
    }
}

/**
 * Récupère et met en cache toutes les références DOM
 */
function cacheDOMElements() {
    DOM.mainVideo = document.getElementById('mainVideo');
    DOM.musicPlayer = document.getElementById('musicPlayer');
    DOM.youtubeContainer = document.getElementById('youtubeContainer');
    DOM.loadingIndicator = document.getElementById('loadingIndicator');
    DOM.errorIndicator = document.getElementById('errorIndicator');
    DOM.tickerBar = document.getElementById('tickerBar');
    DOM.tickerContent = document.getElementById('tickerContent');
    DOM.tickerMessage = document.getElementById('tickerMessage');
    DOM.clock = document.getElementById('clock');
    DOM.currentTime = document.getElementById('currentTime');
    DOM.nowPlaying = document.getElementById('nowPlaying');
    DOM.currentTitle = document.getElementById('currentTitle');
    DOM.musicIndicator = document.getElementById('musicIndicator');
    
    log('✅ Éléments DOM récupérés');
}

// ============================================================================
// CHARGEMENT DES DONNÉES (JSON)
// ============================================================================

/**
 * Charge tous les fichiers JSON de configuration
 */
async function loadDataFiles() {
    log('📁 Chargement des fichiers de configuration...');
    
    try {
        // Charger les trois fichiers en parallèle pour plus de performance
        const [playlistData, musicData, scheduleData] = await Promise.all([
            fetch(CONFIG.playlistFile).then(res => res.json()),
            fetch(CONFIG.musicFile).then(res => res.json()),
            fetch(CONFIG.scheduleFile).then(res => res.json())
        ]);
        
        APP_STATE.playlist = playlistData.videos || [];
        APP_STATE.musicTracks = musicData.tracks || [];
        APP_STATE.scheduledEvents = scheduleData.events || [];
        
        log(`✅ Données chargées: ${APP_STATE.playlist.length} vidéos, ${APP_STATE.musicTracks.length} musiques, ${APP_STATE.scheduledEvents.length} événements`);
        
        // Vérifier qu'il y a au moins une vidéo
        if (APP_STATE.playlist.length === 0) {
            throw new Error('Aucune vidéo dans la playlist');
        }
        
    } catch (error) {
        logError('❌ Erreur lors du chargement des fichiers JSON', error);
        throw error;
    }
}

// ============================================================================
// GESTION DE LA LECTURE VIDÉO PRINCIPALE
// ============================================================================

/**
 * Lance la lecture de la prochaine vidéo de la playlist
 */
function playNextVideo() {
    // Vérifier s'il est temps pour une pause musicale
    if (shouldInsertMusicBreak()) {
        log('🎵 Insertion d\'une pause musicale');
        playMusicBreak();
        return;
    }
    
    // Vérifier s'il y a un événement planifié à déclencher
    const scheduledEvent = checkScheduledEvents();
    if (scheduledEvent) {
        log(`📅 Événement planifié: ${scheduledEvent.title}`);
        playScheduledEvent(scheduledEvent);
        return;
    }
    
    // Lecture normale: passer à la vidéo suivante
    const video = getNextVideo();
    
    if (!video) {
        logError('❌ Aucune vidéo disponible');
        // Réinitialiser l'index et réessayer
        APP_STATE.currentVideoIndex = 0;
        setTimeout(playNextVideo, 3000);
        return;
    }
    
    log(`▶️ Lecture de: ${video.title}`);
    
    APP_STATE.currentMediaType = 'video';
    APP_STATE.currentMediaTitle = video.title;
    APP_STATE.isPlayingMusic = false;
    APP_STATE.isPlayingScheduledEvent = false;
    
    // Mettre à jour l'interface
    updateNowPlaying(video.title);
    hideMusicIndicator();
    
    // Charger et lire la vidéo selon son type
    if (video.type === 'youtube' && CONFIG.enableYouTube) {
        playYouTubeVideo(video);
    } else {
        playLocalVideo(video);
    }
}

/**
 * Récupère la prochaine vidéo de la playlist
 */
function getNextVideo() {
    // Boucler sur la playlist jusqu'à trouver une vidéo valide
    const startIndex = APP_STATE.currentVideoIndex;
    let attempts = 0;
    
    while (attempts < APP_STATE.playlist.length) {
        const video = APP_STATE.playlist[APP_STATE.currentVideoIndex];
        
        // Vérifier si cette vidéo a échoué précédemment
        if (!APP_STATE.failedVideos.has(video.id)) {
            return video;
        }
        
        // Passer à la suivante
        APP_STATE.currentVideoIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
        attempts++;
    }
    
    // Si toutes les vidéos ont échoué, réinitialiser les échecs
    log('⚠️ Toutes les vidéos ont échoué, réinitialisation...');
    APP_STATE.failedVideos.clear();
    APP_STATE.currentVideoIndex = startIndex;
    
    return APP_STATE.playlist[APP_STATE.currentVideoIndex];
}

/**
 * Lit une vidéo locale (fichier .mp4)
 */
function playLocalVideo(video) {
    const videoElement = DOM.mainVideo;
    
    // Réinitialiser le compteur de retry pour cette vidéo
    APP_STATE.videoRetryCount = 0;
    
    // Afficher l'indicateur de chargement
    showLoading();
    
    // Cacher le conteneur YouTube si actif
    if (DOM.youtubeContainer) {
        DOM.youtubeContainer.classList.remove('active');
    }
    
    // Construire le chemin complet
    const videoPath = CONFIG.pathPrefix + video.src;
    
    // Configurer le timeout de chargement
    APP_STATE.videoLoadingTimeout = setTimeout(() => {
        logError(`⏱️ Timeout de chargement pour: ${video.title}`);
        handleVideoError(video);
    }, CONFIG.videoLoadTimeoutSeconds * 1000);
    
    // Charger la vidéo
    videoElement.src = videoPath;
    videoElement.load();
    
    // Tenter de lire
    const playPromise = videoElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                log(`✅ Lecture démarrée: ${video.title}`);
                clearTimeout(APP_STATE.videoLoadingTimeout);
                hideLoading();
            })
            .catch(error => {
                logError(`❌ Erreur de lecture: ${video.title}`, error);
                handleVideoError(video);
            });
    }
}

/**
 * Lit une vidéo YouTube (via IFrame API)
 */
function playYouTubeVideo(video) {
    log(`🎬 Chargement YouTube: ${video.title}`);
    
    showLoading();
    
    // Cacher la vidéo HTML5
    DOM.mainVideo.style.display = 'none';
    
    // Afficher le conteneur YouTube
    DOM.youtubeContainer.classList.add('active');
    
    // Créer ou mettre à jour le player YouTube
    if (!APP_STATE.youtubePlayer) {
        // Créer un nouveau player
        if (typeof YT !== 'undefined' && YT.Player) {
            APP_STATE.youtubePlayer = new YT.Player('youtubeContainer', {
                width: '1920',
                height: '1080',
                videoId: video.src,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    fs: 0,
                    playsinline: 1
                },
                events: {
                    onReady: () => {
                        hideLoading();
                        APP_STATE.youtubeReady = true;
                    },
                    onStateChange: onYouTubePlayerStateChange,
                    onError: () => {
                        logError(`❌ Erreur YouTube: ${video.title}`);
                        handleVideoError(video);
                    }
                }
            });
        } else {
            logError('❌ API YouTube non disponible');
            handleVideoError(video);
        }
    } else {
        // Charger une nouvelle vidéo dans le player existant
        APP_STATE.youtubePlayer.loadVideoById(video.src);
        hideLoading();
    }
}

/**
 * Gère les changements d'état du player YouTube
 */
function onYouTubePlayerStateChange(event) {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
        log('✅ Vidéo YouTube terminée');
        onVideoEnded();
    }
}

/**
 * Appelé quand une vidéo se termine
 */
function onVideoEnded() {
    log('✅ Vidéo terminée');
    
    // Nettoyer les ressources si configuré
    if (CONFIG.cleanupVideosAfterPlay) {
        cleanupVideo();
    }
    
    // Incrémenter l'index
    APP_STATE.currentVideoIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
    
    // Passer à la suivante
    playNextVideo();
}

/**
 * Gère les erreurs de chargement/lecture vidéo
 */
function handleVideoError(video) {
    clearTimeout(APP_STATE.videoLoadingTimeout);
    hideLoading();
    
    APP_STATE.videoRetryCount++;
    
    if (APP_STATE.videoRetryCount < CONFIG.maxRetryAttempts) {
        log(`🔄 Nouvelle tentative (${APP_STATE.videoRetryCount}/${CONFIG.maxRetryAttempts}) pour: ${video.title}`);
        showError(`Erreur - Nouvelle tentative...`);
        setTimeout(() => {
            hideError();
            playLocalVideo(video);
        }, 2000);
    } else {
        // Marquer cette vidéo comme échouée
        APP_STATE.failedVideos.add(video.id);
        log(`❌ Échec définitif pour: ${video.title}`);
        showError('Passage à la vidéo suivante...');
        
        setTimeout(() => {
            hideError();
            APP_STATE.currentVideoIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
            playNextVideo();
        }, 2000);
    }
}

/**
 * Nettoie les ressources vidéo pour éviter les fuites mémoire
 */
function cleanupVideo() {
    if (DOM.mainVideo) {
        DOM.mainVideo.pause();
        DOM.mainVideo.removeAttribute('src');
        DOM.mainVideo.load();
    }
}

// ============================================================================
// GESTION DES PAUSES MUSICALES (INTERCALAIRES)
// ============================================================================

/**
 * Vérifie s'il est temps d'insérer une pause musicale
 */
function shouldInsertMusicBreak() {
    const now = Date.now();
    const timeSinceLastBreak = (now - APP_STATE.lastMusicBreakTime) / 1000 / 60; // en minutes
    
    // Vérifier si on a dépassé l'intervalle configuré
    return timeSinceLastBreak >= CONFIG.musicIntervalMinutes;
}

/**
 * Calcule le prochain temps de pause musicale
 */
function calculateNextMusicBreak() {
    const intervalMs = CONFIG.musicIntervalMinutes * 60 * 1000;
    APP_STATE.nextMusicBreakTime = APP_STATE.lastMusicBreakTime + intervalMs;
    log(`⏰ Prochaine pause musicale: ${new Date(APP_STATE.nextMusicBreakTime).toLocaleTimeString('fr-FR')}`);
}

/**
 * Lance une pause musicale
 */
function playMusicBreak() {
    if (APP_STATE.musicTracks.length === 0) {
        log('⚠️ Aucune musique disponible, passage à la vidéo suivante');
        playNextVideo();
        return;
    }
    
    const track = getNextMusicTrack();
    
    if (!track) {
        log('⚠️ Impossible de récupérer une piste musicale');
        playNextVideo();
        return;
    }
    
    log(`🎵 Pause musicale: ${track.title}`);
    
    APP_STATE.isPlayingMusic = true;
    APP_STATE.currentMediaType = 'music';
    APP_STATE.currentMediaTitle = track.title;
    APP_STATE.lastMusicBreakTime = Date.now();
    
    // Calculer le prochain temps de pause
    calculateNextMusicBreak();
    
    // Mettre à jour l'interface
    updateNowPlaying(track.title);
    showMusicIndicator();
    
    // Cacher la vidéo et YouTube
    DOM.mainVideo.style.display = 'none';
    if (DOM.youtubeContainer) {
        DOM.youtubeContainer.classList.remove('active');
    }
    
    // Charger et lire la musique
    const audioPath = CONFIG.pathPrefix + track.src;
    DOM.musicPlayer.src = audioPath;
    DOM.musicPlayer.load();
    
    const playPromise = DOM.musicPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                log(`✅ Musique démarrée: ${track.title}`);
            })
            .catch(error => {
                logError(`❌ Erreur lecture musique: ${track.title}`, error);
                // En cas d'erreur, passer à la vidéo suivante
                onMusicEnded();
            });
    }
    
    // Configurer un timeout de sécurité (durée maximale)
    const maxDuration = CONFIG.maxMusicDurationMinutes * 60 * 1000;
    setTimeout(() => {
        if (APP_STATE.isPlayingMusic) {
            log('⏱️ Durée maximale atteinte, arrêt de la musique');
            onMusicEnded();
        }
    }, maxDuration);
}

/**
 * Récupère la prochaine piste musicale selon le mode de sélection
 */
function getNextMusicTrack() {
    if (CONFIG.musicSelectionMode === 'random') {
        // Mode aléatoire
        const randomIndex = Math.floor(Math.random() * APP_STATE.musicTracks.length);
        return APP_STATE.musicTracks[randomIndex];
    } else {
        // Mode séquentiel
        const track = APP_STATE.musicTracks[APP_STATE.currentMusicIndex];
        APP_STATE.currentMusicIndex = (APP_STATE.currentMusicIndex + 1) % APP_STATE.musicTracks.length;
        return track;
    }
}

/**
 * Appelé quand une musique se termine
 */
function onMusicEnded() {
    log('✅ Musique terminée');
    
    APP_STATE.isPlayingMusic = false;
    hideMusicIndicator();
    
    // Nettoyer le lecteur audio
    DOM.musicPlayer.pause();
    DOM.musicPlayer.removeAttribute('src');
    DOM.musicPlayer.load();
    
    // Réafficher la vidéo
    DOM.mainVideo.style.display = 'block';
    
    // Reprendre la lecture des vidéos
    playNextVideo();
}

// ============================================================================
// GESTION DES ÉVÉNEMENTS PLANIFIÉS (SCHEDULE)
// ============================================================================

/**
 * Vérifie s'il y a un événement planifié à déclencher maintenant
 */
function checkScheduledEvents() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentSeconds = now.getSeconds();
    
    // Parcourir tous les événements planifiés
    for (const event of APP_STATE.scheduledEvents) {
        // Vérifier si l'événement est actif aujourd'hui
        if (!event.days.includes(currentDay)) {
            continue;
        }
        
        // Vérifier si on est dans la fenêtre de temps (avec tolérance)
        if (event.time === currentTime && currentSeconds <= CONFIG.scheduleToleranceSeconds) {
            return event;
        }
    }
    
    return null;
}

/**
 * Lance un événement planifié
 */
function playScheduledEvent(event) {
    log(`📅 Événement planifié: ${event.title}`);
    
    APP_STATE.isPlayingScheduledEvent = true;
    APP_STATE.currentMediaType = 'schedule';
    APP_STATE.currentMediaTitle = event.video.title;
    
    // Mettre à jour l'interface
    updateNowPlaying(`⭐ ${event.video.title}`);
    hideMusicIndicator();
    
    // Gérer l'interruption selon le mode configuré
    if (CONFIG.scheduleInterruptMode === 'fade') {
        // Faire un fondu
        DOM.mainVideo.classList.add('fade-out');
        setTimeout(() => {
            playScheduledVideo(event.video);
        }, CONFIG.fadeDurationMs);
    } else {
        // Attendre la fin de la vidéo en cours (déjà géré par le flux naturel)
        playScheduledVideo(event.video);
    }
}

/**
 * Lit la vidéo d'un événement planifié
 */
function playScheduledVideo(video) {
    if (video.type === 'youtube' && CONFIG.enableYouTube) {
        playYouTubeVideo(video);
    } else {
        playLocalVideo(video);
    }
}

/**
 * Appelé quand un événement planifié se termine
 */
function onScheduledEventEnded() {
    log('✅ Événement planifié terminé');
    APP_STATE.isPlayingScheduledEvent = false;
    
    // Reprendre la lecture normale
    playNextVideo();
}

// ============================================================================
// GESTION DU BANDEAU D'INFORMATION (TICKER)
// ============================================================================

/**
 * Met à jour le message du bandeau selon la logique métier
 */
function updateTickerMessage() {
    const now = Date.now();
    const timeUntilBreak = APP_STATE.nextMusicBreakTime - now;
    const timeUntilBreakMinutes = Math.floor(timeUntilBreak / 1000 / 60);
    
    // Calculer le seuil (30% de l'intervalle total)
    const thresholdMinutes = CONFIG.musicIntervalMinutes * CONFIG.musicThresholdPercent;
    
    let message = '';
    
    // LOGIQUE CONDITIONNELLE STRICTE (Règle des 30%)
    if (timeUntilBreakMinutes > thresholdMinutes) {
        // On est loin de la pause: afficher le temps restant
        message = `🎵 Prochaine pause musicale dans ${timeUntilBreakMinutes} minute${timeUntilBreakMinutes > 1 ? 's' : ''}`;
    } else {
        // On est proche de la pause: afficher le titre de la prochaine vidéo/événement
        const nextItem = getNextItemInfo();
        message = `⏭️ À venir: ${nextItem}`;
    }
    
    // Mettre à jour le texte du bandeau
    if (DOM.tickerMessage.textContent !== message) {
        DOM.tickerMessage.textContent = message;
        
        // Recalculer la durée de l'animation en fonction de la longueur du texte
        const messageWidth = DOM.tickerMessage.offsetWidth;
        const duration = messageWidth / CONFIG.tickerSpeed;
        DOM.tickerMessage.style.animationDuration = `${duration}s`;
    }
}

/**
 * Récupère l'information sur le prochain élément (vidéo ou événement)
 */
function getNextItemInfo() {
    // Vérifier s'il y a un événement planifié imminent
    const nextEvent = getNextScheduledEvent();
    if (nextEvent) {
        return `${nextEvent.title} (${nextEvent.time})`;
    }
    
    // Sinon, retourner le titre de la prochaine vidéo
    const nextIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
    const nextVideo = APP_STATE.playlist[nextIndex];
    
    return nextVideo ? nextVideo.title : 'Contenu à venir';
}

/**
 * Trouve le prochain événement planifié
 */
function getNextScheduledEvent() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    let closestEvent = null;
    let minDiff = Infinity;
    
    for (const event of APP_STATE.scheduledEvents) {
        // Vérifier si l'événement est actif aujourd'hui
        if (!event.days.includes(currentDay)) {
            continue;
        }
        
        // Convertir l'heure de l'événement en minutes
        const [hours, minutes] = event.time.split(':').map(Number);
        const eventTime = hours * 60 + minutes;
        
        // Calculer la différence
        const diff = eventTime - currentTime;
        
        // Garder seulement les événements futurs
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            closestEvent = event;
        }
    }
    
    return closestEvent;
}

/**
 * Met à jour l'affichage "En cours"
 */
function updateNowPlaying(title) {
    DOM.currentTitle.textContent = title;
    DOM.nowPlaying.classList.add('visible');
    
    // Masquer après un certain temps
    setTimeout(() => {
        DOM.nowPlaying.classList.remove('visible');
    }, CONFIG.messageDisplayDuration);
}

/**
 * Affiche l'indicateur de pause musicale
 */
function showMusicIndicator() {
    DOM.musicIndicator.classList.add('visible');
}

/**
 * Cache l'indicateur de pause musicale
 */
function hideMusicIndicator() {
    DOM.musicIndicator.classList.remove('visible');
}

// ============================================================================
// GESTION DE L'HORLOGE
// ============================================================================

/**
 * Met à jour l'horloge en temps réel
 */
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(CONFIG.timeLocale, CONFIG.timeFormat);
    DOM.currentTime.textContent = timeString;
}

// ============================================================================
// GESTION DES INDICATEURS (CHARGEMENT / ERREUR)
// ============================================================================

function showLoading() {
    if (CONFIG.showLoadingIndicator) {
        DOM.loadingIndicator.classList.add('visible');
    }
}

function hideLoading() {
    DOM.loadingIndicator.classList.remove('visible');
}

function showError(message) {
    DOM.errorIndicator.querySelector('.error-text').textContent = message;
    DOM.errorIndicator.classList.add('visible');
}

function hideError() {
    DOM.errorIndicator.classList.remove('visible');
}

// ============================================================================
// CONFIGURATION DES ÉVÉNEMENTS (EVENT LISTENERS)
// ============================================================================

/**
 * Configure tous les écouteurs d'événements
 */
function setupEventListeners() {
    // Événement: Fin de vidéo
    DOM.mainVideo.addEventListener('ended', () => {
        if (APP_STATE.isPlayingScheduledEvent) {
            onScheduledEventEnded();
        } else {
            onVideoEnded();
        }
    });
    
    // Événement: Erreur de chargement vidéo
    DOM.mainVideo.addEventListener('error', (e) => {
        const video = APP_STATE.playlist[APP_STATE.currentVideoIndex];
        logError('❌ Erreur vidéo (event)', e);
        handleVideoError(video);
    });
    
    // Événement: Fin de musique
    DOM.musicPlayer.addEventListener('ended', onMusicEnded);
    
    // Événement: Erreur de chargement audio
    DOM.musicPlayer.addEventListener('error', (e) => {
        logError('❌ Erreur audio (event)', e);
        onMusicEnded();
    });
    
    // Événement: Vidéo peut être lue (metadata chargées)
    DOM.mainVideo.addEventListener('loadedmetadata', () => {
        log('✅ Metadata vidéo chargées');
    });
    
    log('✅ Écouteurs d\'événements configurés');
}

// ============================================================================
// GESTION DES INTERVALLES ET TIMERS
// ============================================================================

/**
 * Démarre tous les intervalles nécessaires
 */
function startIntervals() {
    // Mise à jour de l'horloge (toutes les secondes)
    APP_STATE.clockUpdateInterval = setInterval(updateClock, 1000);
    updateClock(); // Appel immédiat
    
    // Mise à jour du bandeau (selon CONFIG.tickerUpdateInterval)
    APP_STATE.tickerUpdateInterval = setInterval(updateTickerMessage, CONFIG.tickerUpdateInterval);
    updateTickerMessage(); // Appel immédiat
    
    // Vérification des événements planifiés (toutes les 10 secondes)
    APP_STATE.scheduleCheckInterval = setInterval(() => {
        const event = checkScheduledEvents();
        if (event && !APP_STATE.isPlayingScheduledEvent) {
            log(`📅 Déclenchement d'événement planifié: ${event.title}`);
            // L'événement sera géré au prochain appel de playNextVideo
        }
    }, 10000);
    
    log('✅ Intervalles démarrés');
}

/**
 * Arrête tous les intervalles (pour nettoyage)
 */
function stopIntervals() {
    clearInterval(APP_STATE.clockUpdateInterval);
    clearInterval(APP_STATE.tickerUpdateInterval);
    clearInterval(APP_STATE.scheduleCheckInterval);
    clearTimeout(APP_STATE.videoLoadingTimeout);
    
    log('⏸️ Intervalles arrêtés');
}

// ============================================================================
// UTILITAIRES ET HELPERS
// ============================================================================

/**
 * Log avec timestamp (si debug activé)
 */
function log(message) {
    if (CONFIG.debugMode) {
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        console.log(`[${timestamp}] ${message}`);
    }
}

/**
 * Log d'erreur (toujours affiché)
 */
function logError(message, error = null) {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    console.error(`[${timestamp}] ${message}`, error || '');
}

/**
 * Convertit une durée "MM:SS" ou "HH:MM:SS" en secondes
 */
function durationToSeconds(duration) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

/**
 * Formate un nombre de secondes en "MM:SS"
 */
function secondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================================================
// CALLBACK YOUTUBE API (si activé)
// ============================================================================

/**
 * Fonction appelée automatiquement par l'API YouTube quand elle est prête
 */
function onYouTubeIframeAPIReady() {
    log('✅ API YouTube prête');
    APP_STATE.youtubeReady = true;
}

// Exposer la fonction pour l'API YouTube
if (CONFIG.enableYouTube) {
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}

// ============================================================================
// GESTION DE LA FERMETURE / NETTOYAGE
// ============================================================================

/**
 * Nettoie les ressources avant la fermeture (prévention des fuites mémoire)
 */
window.addEventListener('beforeunload', () => {
    log('🧹 Nettoyage avant fermeture...');
    stopIntervals();
    cleanupVideo();
    
    if (APP_STATE.youtubePlayer) {
        APP_STATE.youtubePlayer.destroy();
    }
});

// ============================================================================
// DÉMARRAGE AUTOMATIQUE
// ============================================================================

// Attendre que le DOM soit complètement chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM déjà chargé
    initializeApp();
}

// ============================================================================
// FIN DU FICHIER APP.JS
// ============================================================================
