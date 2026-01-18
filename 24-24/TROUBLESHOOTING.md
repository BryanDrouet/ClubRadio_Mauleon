# 🔧 Guide de Dépannage - ClubRadio 24/7

Guide complet pour résoudre tous les problèmes courants.

---

## 📑 Table des Matières

1. [Problèmes de Chargement](#problèmes-de-chargement)
2. [Problèmes Audio/Vidéo](#problèmes-audiovid%C3%A9o)
3. [Problèmes d'Affichage](#problèmes-daffichage)
4. [Problèmes de Performance](#problèmes-de-performance)
5. [Problèmes OBS](#problèmes-obs)
6. [Outils de Diagnostic](#outils-de-diagnostic)

---

## 🚫 Problèmes de Chargement

### Symptôme : Écran noir, aucune vidéo ne charge

**Diagnostic :**
1. Ouvrir la console (F12)
2. Chercher les erreurs 404

**Causes et Solutions :**

#### ❌ Erreur : `404 Not Found` pour les vidéos

```
Solution 1 : Vérifier le pathPrefix dans config.js
```

```javascript
// config.js - Vérifier que le chemin est correct
const CONFIG = {
    pathPrefix: "../assets/",  // Relatif à index.html
    // Si vos fichiers sont ailleurs :
    // pathPrefix: "./assets/"     → même dossier que index.html
    // pathPrefix: "../../media/"  → deux niveaux au-dessus
};
```

```
Solution 2 : Vérifier que les fichiers existent réellement
```

```bash
# Structure attendue :
ClubRadio_Mauleon/
├── 24-24/
│   └── index.html
└── assets/
    ├── video1.mp4  ← Les vidéos doivent être ICI
    └── music/
```

```
Solution 3 : Vérifier les noms de fichiers dans playlist.json
```

```json
// playlist.json - Le "src" doit correspondre au nom exact du fichier
{
    "id": "video_001",
    "src": "presentation_clubradio.mp4"  // ← Nom EXACT (case sensitive)
}
```

#### ❌ Erreur : `Failed to load resource`

**Cause :** Problème de permissions ou fichier corrompu

```bash
# Vérifier les permissions
ls -la assets/*.mp4

# Ré-encoder si corrompu
ffmpeg -i video_corrompu.mp4 -c copy video_repare.mp4
```

---

### Symptôme : Chargement infini (spinner tourne indéfiniment)

**Cause :** Timeout atteint

```javascript
// config.js - Augmenter le timeout
videoLoadTimeoutSeconds: 30,  // Au lieu de 15
```

**Alternative :** Fichier trop lourd

```bash
# Réduire la taille du fichier
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4
```

---

## 🎬 Problèmes Audio/Vidéo

### Symptôme : Vidéo joue mais pas de son

**Solution 1 : Autoriser l'autoplay**

```
Chrome/Edge :
1. Clic sur l'icône 🔒 dans la barre d'adresse
2. Paramètres du site → Son → Autoriser
```

**Solution 2 : Vérifier le codec audio**

```bash
# Vérifier le codec
ffmpeg -i video.mp4 2>&1 | grep Audio

# Si ce n'est pas AAC, ré-encoder :
ffmpeg -i input.mp4 -c:v copy -c:a aac output.mp4
```

**Solution 3 : OBS**

```
Dans OBS :
Source Navigateur → ✅ Cocher "Contrôler l'audio via OBS"
```

---

### Symptôme : Pauses musicales ne se déclenchent jamais

**Diagnostic dans la console (F12) :**

```javascript
// Vérifier le calcul du temps
APP_STATE.nextMusicBreakTime
APP_STATE.lastMusicBreakTime
```

**Solutions :**

```javascript
// config.js - Vérifier l'intervalle
musicIntervalMinutes: 20,  // Pas 0 ou nombre négatif !

// Forcer une pause immédiatement (pour tester)
musicIntervalMinutes: 0.5,  // 30 secondes
```

**Vérifier music.json :**

```json
// S'assurer qu'il y a au moins une piste
{
    "tracks": [
        {
            "id": "music_001",
            "title": "Test",
            "src": "music/test.mp3",  // ← Vérifier que le fichier existe
            "duration": "03:00"
        }
    ]
}
```

---

### Symptôme : Vidéo se fige / saccade

**Cause 1 : Fichier trop lourd**

```bash
# Réduire le bitrate
ffmpeg -i input.mp4 -b:v 5000k -maxrate 5000k -bufsize 10000k output.mp4
```

**Cause 2 : Ordinateur surchargé**

```javascript
// config.js - Réduire la charge
tickerUpdateInterval: 100,  // Au lieu de 50 (moins fluide mais moins de CPU)
```

**Cause 3 : OBS en surcharge**

```
Dans OBS :
Paramètres → Sortie → Encoder → Choisir matériel (NVENC/QuickSync)
```

---

## 🖥️ Problèmes d'Affichage

### Symptôme : Bandeau ne défile pas

**Vérifier le CSS (F12 → Onglet "Elements") :**

```css
/* Chercher .ticker-message et vérifier que l'animation est présente */
.ticker-message {
    animation: scroll-ticker linear infinite;  /* ← Doit être là */
}
```

**Si l'animation est présente mais ne bouge pas :**

```javascript
// Console (F12)
document.querySelector('.ticker-message').style.animationPlayState
// Doit retourner "running" (pas "paused")
```

**Solution :**

```javascript
// Forcer le redémarrage de l'animation
const ticker = document.getElementById('tickerMessage');
ticker.style.animation = 'none';
setTimeout(() => {
    ticker.style.animation = '';
}, 10);
```

---

### Symptôme : Horloge ne s'actualise pas

**Vérifier dans la console :**

```javascript
APP_STATE.clockUpdateInterval
// Doit retourner un nombre (ID de l'intervalle)
```

**Si `undefined` :**

```javascript
// Redémarrer l'horloge manuellement
setInterval(updateClock, 1000);
```

---

### Symptôme : Résolution incorrecte dans OBS

**Cause :** Dimensions CSS mal définies

```
Solution OBS :
Source Navigateur → Propriétés :
Largeur : 1920
Hauteur : 1080

✅ Cocher "Actualiser le navigateur quand la scène devient active"
```

**Alternative pour tests locaux :**

```
Appuyer sur F11 (mode plein écran dans le navigateur)
```

---

## ⚡ Problèmes de Performance

### Symptôme : Ralentissements après plusieurs heures

**Cause :** Fuite mémoire

**Solution 1 : Nettoyer les ressources**

```javascript
// config.js
cleanupVideosAfterPlay: true,  // IMPORTANT pour 24/7
```

**Solution 2 : Redémarrage automatique**

```javascript
// Ajouter dans app.js (à la fin)
// Redémarrer toutes les 6 heures
setInterval(() => {
    location.reload();
}, 6 * 60 * 60 * 1000);
```

**Solution 3 : Limiter les retry**

```javascript
// config.js
maxRetryAttempts: 1,  // Au lieu de 2
```

---

### Symptôme : CPU élevé

**Causes et solutions :**

```javascript
// config.js - Réduire la fréquence des mises à jour
tickerUpdateInterval: 100,  // Au lieu de 50

// Désactiver les logs
debugMode: false,

// Désactiver l'indicateur de chargement
showLoadingIndicator: false,
```

**Optimisation vidéo :**

```bash
# Encoder en H.264 avec preset medium
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 output.mp4
```

---

### Symptôme : Mémoire RAM augmente continuellement

**Diagnostic Chrome :**

```
1. F12 → Onglet "Performance"
2. Enregistrer pendant 30 secondes
3. Chercher des patterns de croissance mémoire
```

**Solutions :**

```javascript
// Forcer le garbage collection tous les 10 vidéos
let videoCount = 0;
DOM.mainVideo.addEventListener('ended', () => {
    videoCount++;
    if (videoCount % 10 === 0) {
        if (window.gc) window.gc();  // Chrome avec --js-flags="--expose-gc"
    }
});
```

---

## 🎥 Problèmes OBS

### Symptôme : Pas d'audio dans OBS

**Solution complète :**

```
1. Source Navigateur → Propriétés
2. ✅ Cocher "Contrôler l'audio via OBS"
3. Mixer Audio → Vérifier que "Source Navigateur" n'est pas muté
4. Clic droit sur la source → Propriétés avancées audio
   → Monitoring Audio : "Monitor et sortie"
```

---

### Symptôme : Vidéo pixelisée dans OBS

**Cause :** Mise à l'échelle incorrecte

```
Solution :
1. Clic droit sur la source → Transformer → Réinitialiser la transformation
2. Ajuster aux dimensions de la scène
3. Vérifier que FPS = 30 (ou 60)
```

---

### Symptôme : OBS freeze / crash

**Causes possibles :**

```
1. Trop de sources actives
   → Désactiver les sources non utilisées

2. GPU surchargé
   → Paramètres OBS → Sortie → Encoder matériel

3. Page web trop lourde
   → Désactiver debugMode dans config.js
```

---

## 🛠️ Outils de Diagnostic

### Mode Debug Complet

```javascript
// config.js
debugMode: true,

// Puis dans la console (F12)
console.table(APP_STATE);
console.table(CONFIG);
```

### Commandes Console Utiles

```javascript
// Voir l'état actuel
console.log('État:', APP_STATE.currentMediaType);
console.log('Index vidéo:', APP_STATE.currentVideoIndex);
console.log('Prochaine pause:', new Date(APP_STATE.nextMusicBreakTime));

// Forcer la vidéo suivante
playNextVideo();

// Forcer une pause musicale
playMusicBreak();

// Vérifier les événements planifiés
checkScheduledEvents();

// Recharger les données JSON
loadDataFiles();
```

### Tests de Chemins

```javascript
// Vérifier si un fichier est accessible
fetch(CONFIG.pathPrefix + 'test_video.mp4')
    .then(res => console.log('✅ Fichier trouvé:', res.status))
    .catch(err => console.error('❌ Fichier introuvable:', err));
```

### Analyse Performance

```javascript
// Mesurer le temps de chargement d'une vidéo
const start = performance.now();
DOM.mainVideo.addEventListener('loadeddata', () => {
    const end = performance.now();
    console.log(`⏱️ Temps de chargement: ${(end - start).toFixed(2)}ms`);
}, { once: true });
```

---

## 📊 Checklist de Diagnostic Complète

Quand rien ne fonctionne, suivre cette checklist :

### 1. Vérifications Basiques

- [ ] La console (F12) est ouverte pour voir les erreurs
- [ ] `debugMode: true` dans config.js
- [ ] Les fichiers médias existent dans `assets/`
- [ ] Le `pathPrefix` est correct dans config.js

### 2. Vérifications Fichiers JSON

- [ ] `playlist.json` est valide (vérifier sur jsonlint.com)
- [ ] `music.json` est valide
- [ ] `schedule.json` est valide
- [ ] Les chemins dans les JSON correspondent aux fichiers réels

### 3. Vérifications Navigateur

- [ ] Cache vidé (Ctrl + Shift + R)
- [ ] Autoplay autorisé
- [ ] Pas d'extensions bloquantes (AdBlock, etc.)
- [ ] Version récente du navigateur

### 4. Vérifications OBS

- [ ] Source Navigateur créée correctement
- [ ] Dimensions 1920x1080
- [ ] Audio contrôlé via OBS
- [ ] FPS défini (30 minimum)

### 5. Tests de Fichiers

```bash
# Tester l'encodage vidéo
ffprobe assets/video.mp4 2>&1 | grep "Video:"
# Doit afficher h264

# Tester l'encodage audio
ffprobe assets/music/music.mp3 2>&1 | grep "Audio:"
# Doit afficher mp3
```

---

## 🆘 Dernier Recours

Si absolument rien ne fonctionne :

### Reset Complet

```bash
# 1. Sauvegarder vos fichiers JSON personnalisés
cp playlist.json playlist.json.backup
cp music.json music.json.backup
cp schedule.json schedule.json.backup

# 2. Recharger la page en forçant le cache
Ctrl + Shift + R (ou Cmd + Shift + R)

# 3. Vérifier dans un autre navigateur
# Chrome → Firefox → Edge

# 4. Tester avec une vidéo minimale
```

### Vidéo de Test

```json
// playlist.json - Configuration minimale pour tester
{
    "videos": [
        {
            "id": "test",
            "title": "Test",
            "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "duration": "00:30",
            "type": "local"
        }
    ]
}
```

```javascript
// config.js - Pour ce test
pathPrefix: "",  // URL complète dans le JSON
```

---

## 📞 Support

Si le problème persiste après toutes ces étapes :

1. **Activer le mode debug** : `debugMode: true`
2. **Copier les logs de la console** (F12)
3. **Noter** :
   - Version du navigateur
   - Système d'exploitation
   - Fichier JSON concerné
   - Message d'erreur exact
4. **Chercher** le message d'erreur sur Google/StackOverflow

---

## 💡 Astuces Bonus

### Développement Rapide

```javascript
// Réduire les intervalles pour tester plus vite
musicIntervalMinutes: 0.5,  // 30 secondes au lieu de 20 min
```

### Logs Personnalisés

```javascript
// Ajouter dans app.js
function customLog(message) {
    const timestamp = new Date().toISOString();
    console.log(`[CUSTOM ${timestamp}] ${message}`);
}
```

### Auto-Refresh

```javascript
// Recharger la page tous les jours à 4h du matin
const now = new Date();
const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 4, 0, 0);
const msToNight = night.getTime() - now.getTime();

setTimeout(() => {
    location.reload();
}, msToNight);
```

---

**✅ Problème résolu ? Super ! Retour à la [documentation](README.md)**

**❌ Toujours bloqué ? Vérifiez la [FAQ](README.md) ou relisez le [Démarrage Rapide](QUICKSTART.md)**
