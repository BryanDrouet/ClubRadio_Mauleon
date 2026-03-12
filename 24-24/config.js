const CONFIG = {
    
    
    musicIntervalMinutes: 20,
    
    
    musicThresholdPercent: 0.3,
    
    
    maxMusicDurationMinutes: 5,
    
    
    musicSelectionMode: "random",
    
    
    
    
    scheduleInterruptMode: "wait",
    
    
    fadeDurationMs: 1500,
    
    
    scheduleToleranceSeconds: 30,
    
    
    
    
    pathPrefix: "../assets/",
    
    
    playlistFile: "./playlist.json",
    
    
    musicFile: "./music.json",
    
    
    scheduleFile: "./schedule.json",
    
    
    
    
    videoLoadTimeoutSeconds: 15,
    
    
    maxRetryAttempts: 2,
    
    
    
    
    tickerSpeed: 50,
    
    
    messageDisplayDuration: 5000,
    
    
    timeLocale: "fr-FR",
    
    
    timeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    },
    
    
    
    
    enableYouTube: true,
    
    
    youtubeApiKey: "",
    
    
    
    
    tickerUpdateInterval: 50,
    
    
    debugMode: true,
    
    
    cleanupVideosAfterPlay: true,
    
    
    
    
    resolution: {
        width: 1920,
        height: 1080
    },
    
    
    backgroundColor: "#000000",
    
    
    showLoadingIndicator: true
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
