const APP_STATE = {
    playlist: [],
    musicTracks: [],
    scheduledEvents: [],

    currentVideoIndex: 0,
    currentMusicIndex: 0,

    musicIntervalTimer: null,
    scheduleCheckInterval: null,
    tickerUpdateInterval: null,
    progressUpdateInterval: null,
    videoLoadingTimeout: null,

    isPlayingMusic: false,
    isPlayingScheduledEvent: false,
    currentMediaType: 'video',
    currentMediaTitle: '',
    currentVideo: null,

    lastMusicBreakTime: Date.now(),
    nextMusicBreakTime: null,

    videoRetryCount: 0,
    failedVideos: new Set(),

    youtubePlayer: null,
    youtubeReady: false,

    tickerMode: 'scroll',
};

const DOM = {
    mainVideo: null,
    musicPlayer: null,
    youtubeContainer: null,
    loadingIndicator: null,
    errorIndicator: null,
    tickerBar: null,
    tickerContent: null,
    tickerMessage: null,
    musicIndicator: null,
    progressBar: null,
    videoTitle: null,
    videoTime: null,
    videoRemaining: null,
    progressFill: null,
};

async function initializeApp() {
    log(' Initialisation de ClubRadio 24/7...');

    try {
        cacheDOMElements();

        await loadDataFiles();

        const urlParams = new URLSearchParams(window.location.search);
        const startVideoId = urlParams.get('video');

        if (startVideoId) {
            const videoIndex = APP_STATE.playlist.findIndex(v => v.id === startVideoId);
            if (videoIndex !== -1) {
                APP_STATE.currentVideoIndex = videoIndex;
                log(`Démarrage à la vidéo: ${APP_STATE.playlist[videoIndex].title}`);
            } else {
                log(`Vidéo "${startVideoId}" introuvable, démarrage normal`);
            }
        } else {
            if (APP_STATE.playlist.length > 0) {
                const firstVideoId = APP_STATE.playlist[0].id;
                const newUrl = `${window.location.pathname}?video=${firstVideoId}`;
                window.history.replaceState({}, '', newUrl);
                log(`URL mise à jour avec la première vidéo: ${firstVideoId}`);
            }
        }

        calculateNextMusicBreak();

        startIntervals();

        setupEventListeners();

        playNextVideo();

        log(' Application initialisée avec succès');

    } catch (error) {
        logError(' Erreur fatale lors de l\'initialisation', error);
        showError('Erreur de chargement du système');
    }
}

function cacheDOMElements() {
    DOM.mainVideo = document.getElementById('mainVideo');
    DOM.musicPlayer = document.getElementById('musicPlayer');
    DOM.youtubeContainer = document.getElementById('youtubeContainer');
    DOM.loadingIndicator = document.getElementById('loadingIndicator');
    DOM.errorIndicator = document.getElementById('errorIndicator');
    DOM.tickerBar = document.getElementById('tickerBar');
    DOM.tickerContent = document.getElementById('tickerContent');
    DOM.tickerMessage = document.getElementById('tickerMessage');
    DOM.musicIndicator = document.getElementById('musicIndicator');

    DOM.progressBar = document.getElementById('progressBar');
    DOM.videoTitle = document.getElementById('videoTitle');
    DOM.videoTime = document.getElementById('videoTime');
    DOM.videoRemaining = document.getElementById('videoRemaining');
    DOM.progressFill = document.getElementById('progressFill');

    log(' Éléments DOM récupérés');
}

async function loadDataFiles() {
    log(' Chargement des fichiers de configuration...');

    try {
        const [playlistData, musicData, scheduleData] = await Promise.all([
            fetch(CONFIG.playlistFile).then(res => res.json()),
            fetch(CONFIG.musicFile).then(res => res.json()),
            fetch(CONFIG.scheduleFile).then(res => res.json())
        ]);

        APP_STATE.playlist = playlistData.videos || [];
        APP_STATE.musicTracks = musicData.tracks || [];
        APP_STATE.scheduledEvents = scheduleData.events || [];

        log(`Données chargées: ${APP_STATE.playlist.length} vidéos, ${APP_STATE.musicTracks.length} musiques, ${APP_STATE.scheduledEvents.length} événements`);

        if (APP_STATE.playlist.length === 0) {
            throw new Error('Aucune vidéo dans la playlist');
        }

    } catch (error) {
        logError(' Erreur lors du chargement des fichiers JSON', error);
        throw error;
    }
}

function playNextVideo() {
    if (shouldInsertMusicBreak()) {
        log(' Insertion d\'une pause musicale');
        playMusicBreak();
        return;
    }

    const scheduledEvent = checkScheduledEvents();
    if (scheduledEvent) {
        log(`Événement planifié: ${scheduledEvent.title}`);
        playScheduledEvent(scheduledEvent);
        return;
    }

    const video = getNextVideo();

    if (!video) {
        logError(' Aucune vidéo disponible');
        APP_STATE.currentVideoIndex = 0;
        setTimeout(playNextVideo, 3000);
        return;
    }

    log(`Lecture de: ${video.title}`);

    APP_STATE.currentMediaType = 'video';
    APP_STATE.currentMediaTitle = video.title;
    APP_STATE.isPlayingMusic = false;
    APP_STATE.isPlayingScheduledEvent = false;
    APP_STATE.currentVideo = video;

    showProgress();
    hideMusicIndicator();

    if (video.type === 'youtube' && CONFIG.enableYouTube) {
        playYouTubeVideo(video);
    } else {
        playLocalVideo(video);
    }
}

function getNextVideo() {
    const startIndex = APP_STATE.currentVideoIndex;
    let attempts = 0;

    while (attempts < APP_STATE.playlist.length) {
        const video = APP_STATE.playlist[APP_STATE.currentVideoIndex];

        if (!APP_STATE.failedVideos.has(video.id)) {
            return video;
        }

        APP_STATE.currentVideoIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
        attempts++;
    }

    log(' Toutes les vidéos ont échoué, réinitialisation...');
    APP_STATE.failedVideos.clear();
    APP_STATE.currentVideoIndex = startIndex;

    return APP_STATE.playlist[APP_STATE.currentVideoIndex];
}

function playLocalVideo(video) {
    const videoElement = DOM.mainVideo;

    APP_STATE.videoRetryCount = 0;

    showLoading();

    if (DOM.youtubeContainer) {
        DOM.youtubeContainer.classList.remove('active');
    }

    const videoPath = CONFIG.pathPrefix + video.src;

    APP_STATE.videoLoadingTimeout = setTimeout(() => {
        logError(`Timeout de chargement pour: ${video.title}`);
        handleVideoError(video);
    }, CONFIG.videoLoadTimeoutSeconds * 1000);

    videoElement.src = videoPath;
    videoElement.load();

    const playPromise = videoElement.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                log(`Lecture démarrée: ${video.title}`);
                clearTimeout(APP_STATE.videoLoadingTimeout);
                hideLoading();
                showProgress();
                startProgressTracking();
            })
            .catch(error => {
                logError(`Erreur de lecture: ${video.title}`, error);
                handleVideoError(video);
            });
    }
}

function playYouTubeVideo(video) {
    log(`Chargement YouTube: ${video.title}`);

    showLoading();

    const videoId = parseYouTubeURL(video.src);

    if (!videoId) {
        logError(`URL YouTube invalide: ${video.src}`);
        handleVideoError(video);
        return;
    }

    DOM.mainVideo.style.display = 'none';

    DOM.youtubeContainer.classList.add('active');

    if (!APP_STATE.youtubePlayer) {
        if (typeof YT !== 'undefined' && YT.Player) {
            APP_STATE.youtubePlayer = new YT.Player('youtubeContainer', {
                width: '1920',
                height: '1080',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    fs: 0,
                    playsinline: 1,
                    hd: 1,
                    vq: 'hd1080'
                },
                events: {
                    onReady: (event) => {
                        hideLoading();
                        APP_STATE.youtubeReady = true;
                        const player = event.target;
                        player.setPlaybackQuality('hd1080');

                        setTimeout(() => {
                            player.setPlaybackQuality('hd1080');
                        }, 500);

                        setTimeout(() => {
                            player.setPlaybackQuality('hd1080');
                        }, 2000);

                        showProgress();
                        startProgressTracking();
                    },
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.PLAYING) {
                            event.target.setPlaybackQuality('hd1080');
                        }
                        onYouTubePlayerStateChange(event);
                    },
                    onError: () => {
                        logError(`Erreur YouTube: ${video.title}`);
                        handleVideoError(video);
                    }
                }
            });
        } else {
            logError(' API YouTube non disponible');
            handleVideoError(video);
        }
    } else {
        APP_STATE.youtubePlayer.loadVideoById({
            videoId: videoId,
            suggestedQuality: 'hd1080'
        });
        setTimeout(() => {
            APP_STATE.youtubePlayer.setPlaybackQuality('hd1080');
        }, 1000);
        hideLoading();
        showProgress();
    }
}

function onYouTubePlayerStateChange(event) {
    if (event.data === 0) {
        log(' Vidéo YouTube terminée');
        onVideoEnded();
    }
}

function onVideoEnded() {
    log(' Vidéo terminée');

    stopProgressTracking();
    hideProgress();

    if (CONFIG.cleanupVideosAfterPlay) {
        cleanupVideo();
    }

    APP_STATE.currentVideoIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;

    playNextVideo();
}

function handleVideoError(video) {
    clearTimeout(APP_STATE.videoLoadingTimeout);
    hideLoading();

    APP_STATE.videoRetryCount++;

    if (APP_STATE.videoRetryCount < CONFIG.maxRetryAttempts) {
        log(`Nouvelle tentative (${APP_STATE.videoRetryCount}/${CONFIG.maxRetryAttempts}) pour: ${video.title}`);
        showError(`Erreur - Nouvelle tentative...`);
        setTimeout(() => {
            hideError();
            if (video.type === 'youtube' && CONFIG.enableYouTube) {
                playYouTubeVideo(video);
            } else {
                playLocalVideo(video);
            }
        }, 2000);
    } else {
        APP_STATE.failedVideos.add(video.id);
        log(`Échec définitif pour: ${video.title}`);
        showError('Passage à la vidéo suivante...');

        setTimeout(() => {
            hideError();
            APP_STATE.currentVideoIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
            playNextVideo();
        }, 2000);
    }
}

function cleanupVideo() {
    if (DOM.mainVideo) {
        DOM.mainVideo.pause();
        DOM.mainVideo.removeAttribute('src');
        DOM.mainVideo.load();
    }
}

function shouldInsertMusicBreak() {
    const now = Date.now();
    const timeSinceLastBreak = (now - APP_STATE.lastMusicBreakTime) / 1000 / 60;

    return timeSinceLastBreak >= CONFIG.musicIntervalMinutes;
}

function calculateNextMusicBreak() {
    const intervalMs = CONFIG.musicIntervalMinutes * 60 * 1000;
    APP_STATE.nextMusicBreakTime = APP_STATE.lastMusicBreakTime + intervalMs;
    log(`Prochaine pause musicale: ${new Date(APP_STATE.nextMusicBreakTime).toLocaleTimeString('fr-FR')}`);
}

function playMusicBreak() {
    if (APP_STATE.musicTracks.length === 0) {
        log(' Aucune musique disponible, passage à la vidéo suivante');
        playNextVideo();
        return;
    }

    const track = getNextMusicTrack();

    if (!track) {
        log(' Impossible de récupérer une piste musicale');
        playNextVideo();
        return;
    }

    log(`Pause musicale: ${track.title}`);

    APP_STATE.isPlayingMusic = true;
    APP_STATE.currentMediaType = 'music';
    APP_STATE.currentMediaTitle = track.title;
    APP_STATE.lastMusicBreakTime = Date.now();
    APP_STATE.currentVideo = null;

    calculateNextMusicBreak();

    hideProgress();
    showMusicIndicator();

    DOM.mainVideo.style.display = 'none';
    if (DOM.youtubeContainer) {
        DOM.youtubeContainer.classList.remove('active');
    }

    const audioPath = CONFIG.pathPrefix + track.src;
    DOM.musicPlayer.src = audioPath;
    DOM.musicPlayer.load();

    const playPromise = DOM.musicPlayer.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                log(`Musique démarrée: ${track.title}`);
            })
            .catch(error => {
                logError(`Erreur lecture musique: ${track.title}`, error);
                onMusicEnded();
            });
    }

    const maxDuration = CONFIG.maxMusicDurationMinutes * 60 * 1000;
    setTimeout(() => {
        if (APP_STATE.isPlayingMusic) {
            log(' Durée maximale atteinte, arrêt de la musique');
            onMusicEnded();
        }
    }, maxDuration);
}

function getNextMusicTrack() {
    if (CONFIG.musicSelectionMode === 'random') {
        const randomIndex = Math.floor(Math.random() * APP_STATE.musicTracks.length);
        return APP_STATE.musicTracks[randomIndex];
    } else {
        const track = APP_STATE.musicTracks[APP_STATE.currentMusicIndex];
        APP_STATE.currentMusicIndex = (APP_STATE.currentMusicIndex + 1) % APP_STATE.musicTracks.length;
        return track;
    }
}

function onMusicEnded() {
    log(' Musique terminée');

    APP_STATE.isPlayingMusic = false;
    hideMusicIndicator();

    DOM.musicPlayer.pause();
    DOM.musicPlayer.removeAttribute('src');
    DOM.musicPlayer.load();

    DOM.mainVideo.style.display = 'block';

    playNextVideo();
}

function checkScheduledEvents() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentSeconds = now.getSeconds();

    for (const event of APP_STATE.scheduledEvents) {
        if (!event.days.includes(currentDay)) {
            continue;
        }

        if (event.time === currentTime && currentSeconds <= CONFIG.scheduleToleranceSeconds) {
            return event;
        }
    }

    return null;
}

function playScheduledEvent(event) {
    log(`Événement planifié: ${event.title}`);

    APP_STATE.isPlayingScheduledEvent = true;
    APP_STATE.currentMediaType = 'schedule';
    APP_STATE.currentMediaTitle = event.video.title;
    APP_STATE.currentVideo = event.video;

    showProgress();
    hideMusicIndicator();

    if (CONFIG.scheduleInterruptMode === 'fade') {
        DOM.mainVideo.classList.add('fade-out');
        setTimeout(() => {
            playScheduledVideo(event.video);
        }, CONFIG.fadeDurationMs);
    } else {
        playScheduledVideo(event.video);
    }
}

function playScheduledVideo(video) {
    if (video.type === 'youtube' && CONFIG.enableYouTube) {
        playYouTubeVideo(video);
    } else {
        playLocalVideo(video);
    }
}

function onScheduledEventEnded() {
    log(' Événement planifié terminé');
    APP_STATE.isPlayingScheduledEvent = false;

    playNextVideo();
}

function updateTickerMessage() {
    const now = Date.now();
    const timeUntilBreak = APP_STATE.nextMusicBreakTime - now;
    const timeUntilBreakMinutes = Math.floor(timeUntilBreak / 1000 / 60);

    const thresholdMinutes = CONFIG.musicIntervalMinutes * CONFIG.musicThresholdPercent;

    let message = '';

    if (timeUntilBreakMinutes > thresholdMinutes) {
        message = `Prochaine pause musicale dans ${timeUntilBreakMinutes} minute${timeUntilBreakMinutes > 1 ? 's' : ''}`;
    } else {
        const nextItem = getNextItemInfo();
        message = `À venir: ${nextItem}`;
    }

    if (DOM.tickerMessage.textContent !== message) {
        DOM.tickerMessage.textContent = message;

        const messageWidth = DOM.tickerMessage.offsetWidth;
        const duration = messageWidth / CONFIG.tickerSpeed;
        DOM.tickerMessage.style.animationDuration = `${duration}s`;
    }
}

function getNextItemInfo() {
    const nextEvent = getNextScheduledEvent();
    if (nextEvent) {
        return `${nextEvent.title} (${nextEvent.time})`;
    }

    const nextIndex = (APP_STATE.currentVideoIndex + 1) % APP_STATE.playlist.length;
    const nextVideo = APP_STATE.playlist[nextIndex];

    return nextVideo ? nextVideo.title : 'Contenu à venir';
}

function getNextScheduledEvent() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

    let closestEvent = null;
    let minDiff = Infinity;

    for (const event of APP_STATE.scheduledEvents) {
        if (!event.days.includes(currentDay)) {
            continue;
        }

        const [hours, minutes] = event.time.split(':').map(Number);
        const eventTime = hours * 60 + minutes;

        const diff = eventTime - currentTime;

        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            closestEvent = event;
        }
    }

    return closestEvent;
}

function parseYouTubeURL(url) {
    if (!url) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }

    let match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];

    match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];

    match = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];

    log(' Impossible de parser l\'URL YouTube:', url);
    return null;
}

function updateProgress() {
    if (!APP_STATE.currentVideo) return;

    try {
        let currentTime, duration;

        if (APP_STATE.youtubePlayer && APP_STATE.currentVideo.type === 'youtube') {
            currentTime = APP_STATE.youtubePlayer.getCurrentTime();
            duration = APP_STATE.youtubePlayer.getDuration();
        } else if (DOM.mainVideo && DOM.mainVideo.duration) {
            currentTime = DOM.mainVideo.currentTime;
            duration = DOM.mainVideo.duration;
        } else {
            return;
        }

        if (!duration || duration === 0 || isNaN(duration)) return;

        const percentage = (currentTime / duration) * 100;
        const remaining = duration - currentTime;

        DOM.progressFill.style.width = `${percentage}%`;

        DOM.videoTitle.textContent = APP_STATE.currentVideo.title || 'Vidéo en cours';

        DOM.videoTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;

        DOM.videoRemaining.textContent = `-${formatTime(remaining)}`;

    } catch (error) {
        log('Erreur lors de la mise à jour de la progression:', error);
    }
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function showProgress() {
    if (DOM.progressBar) {
        DOM.progressBar.classList.add('visible');
    }
}

function hideProgress() {
    if (DOM.progressBar) {
        DOM.progressBar.classList.remove('visible');
    }
}

function showMusicIndicator() {
    DOM.musicIndicator.classList.add('visible');
}

function hideMusicIndicator() {
    DOM.musicIndicator.classList.remove('visible');
}

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

function setupEventListeners() {
    DOM.mainVideo.addEventListener('ended', () => {
        if (APP_STATE.isPlayingScheduledEvent) {
            onScheduledEventEnded();
        } else {
            onVideoEnded();
        }
    });

    DOM.mainVideo.addEventListener('error', (e) => {
        const video = APP_STATE.playlist[APP_STATE.currentVideoIndex];
        logError(' Erreur vidéo (event)', e);
        handleVideoError(video);
    });

    DOM.musicPlayer.addEventListener('ended', onMusicEnded);

    DOM.musicPlayer.addEventListener('error', (e) => {
        logError(' Erreur audio (event)', e);
        onMusicEnded();
    });

    DOM.mainVideo.addEventListener('loadedmetadata', () => {
        log(' Metadata vidéo chargées');
    });

    log(' Écouteurs d\'événements configurés');
}

function startProgressTracking() {
    if (APP_STATE.progressUpdateInterval) {
        clearInterval(APP_STATE.progressUpdateInterval);
    }

    APP_STATE.progressUpdateInterval = setInterval(updateProgress, 1000);
    updateProgress();

    log(' Tracking de progression démarré');
}

function stopProgressTracking() {
    if (APP_STATE.progressUpdateInterval) {
        clearInterval(APP_STATE.progressUpdateInterval);
        APP_STATE.progressUpdateInterval = null;
    }
}

function startIntervals() {
    APP_STATE.tickerUpdateInterval = setInterval(updateTickerMessage, CONFIG.tickerUpdateInterval);
    updateTickerMessage();

    APP_STATE.scheduleCheckInterval = setInterval(() => {
        const event = checkScheduledEvents();
        if (event && !APP_STATE.isPlayingScheduledEvent) {
            log(`Déclenchement d'événement planifié: ${event.title}`);
        }
    }, 10000);

    log(' Intervalles démarrés');
}

function stopIntervals() {
    clearInterval(APP_STATE.tickerUpdateInterval);
    clearInterval(APP_STATE.scheduleCheckInterval);
    clearInterval(APP_STATE.progressUpdateInterval);
    clearTimeout(APP_STATE.videoLoadingTimeout);

    log(' Intervalles arrêtés');
}

function log(message) {
    if (CONFIG.debugMode) {
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        console.log(`[${timestamp}] ${message}`);
    }
}

function logError(message, error = null) {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    console.error(`[${timestamp}] ${message}`, error || '');
}

function durationToSeconds(duration) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

function secondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function onYouTubeIframeAPIReady() {
    log(' API YouTube prête');
    APP_STATE.youtubeReady = true;
}

if (CONFIG.enableYouTube) {
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}

window.addEventListener('beforeunload', () => {
    log(' Nettoyage avant fermeture...');
    stopIntervals();
    cleanupVideo();

    if (APP_STATE.youtubePlayer) {
        APP_STATE.youtubePlayer.destroy();
    }
});

if (CONFIG.enableYouTube) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
