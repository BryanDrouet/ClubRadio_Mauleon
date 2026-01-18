# 🎙️ ClubRadio 24/7 - Système d'Overlay OBS

Système d'affichage dynamique 24h/24 pour webradio associative, optimisé pour OBS Studio.

## 📋 Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation avec OBS](#utilisation-avec-obs)
- [Structure des Fichiers](#structure-des-fichiers)
- [Personnalisation](#personnalisation)
- [Résolution de Problèmes](#résolution-de-problèmes)

---

## ✨ Fonctionnalités

### 🎬 Lecteur Vidéo Intelligent
- Lecture en boucle automatique de vidéos locales (.mp4)
- Support optionnel de YouTube via IFrame API
- Gestion avancée des erreurs avec retry automatique
- Transitions fluides entre les vidéos

### 🎵 Pauses Musicales Automatiques
- Insertion automatique de musiques à intervalles réguliers
- Mode aléatoire ou séquentiel configurable
- Ne coupe jamais une vidéo en cours (attend toujours la fin)
- Indicateur visuel pendant les pauses

### 📅 Planificateur Horaire
- Événements déclenchés à des heures fixes (ex: météo à 8h, 12h, etc.)
- Configuration par jour de la semaine
- Système de priorités
- Tolérance de déclenchement configurable

### 📊 Bandeau d'Information Dynamique
- **Logique des 30%** : 
  - Si temps restant avant pause > 30% de l'intervalle → Affiche "Prochaine pause dans X minutes"
  - Sinon → Affiche le titre de la prochaine vidéo/événement
- Défilement fluide avec animation GPU-accelerated
- Horloge en temps réel
- Affichage du contenu en cours

### 🛡️ Robustesse
- Gestion d'erreur complète avec fallback automatique
- Optimisé pour tourner 24h/24 sans fuite mémoire
- Timeout de chargement configurable
- Logs détaillés en mode debug

---

## 📦 Installation

### Prérequis
- Navigateur moderne (Chrome, Firefox, Edge)
- OBS Studio (version 27+ recommandée)
- Fichiers vidéo au format MP4 (codec H.264 recommandé)
- Fichiers audio au format MP3

### Étape 1 : Organiser les Fichiers

```
24-24/
├── index.html          # Page principale
├── style.css           # Styles
├── app.js              # Logique JavaScript
├── config.js           # Configuration
├── playlist.json       # Liste des vidéos
├── music.json          # Liste des musiques
└── schedule.json       # Événements planifiés

assets/                 # Dossier des médias (niveau parent)
├── presentation_clubradio.mp4
├── actualites_local.mp4
├── music/
│   ├── jazz_morning.mp3
│   ├── piano_relax.mp3
│   └── ...
└── ...
```

### Étape 2 : Placer vos Médias

1. Placez vos fichiers vidéo dans `../assets/` (un niveau au-dessus du dossier 24-24)
2. Créez un sous-dossier `../assets/music/` pour vos fichiers audio
3. Assurez-vous que les noms correspondent à ceux dans les fichiers JSON

---

## ⚙️ Configuration

### 1️⃣ config.js - Paramètres Globaux

**Fichier le plus important !** Tous les paramètres modifiables sont ici :

```javascript
const CONFIG = {
    musicIntervalMinutes: 20,      // Pause toutes les 20 minutes
    musicThresholdPercent: 0.3,    // Seuil des 30% pour le bandeau
    maxMusicDurationMinutes: 5,    // Durée max d'une pause
    pathPrefix: "../assets/",      // Chemin vers les médias
    debugMode: true,               // Logs dans la console
    // ... voir le fichier pour tous les paramètres
};
```

### 2️⃣ playlist.json - Liste des Vidéos

```json
{
    "videos": [
        {
            "id": "video_001",
            "title": "Présentation ClubRadio",
            "src": "presentation_clubradio.mp4",
            "duration": "02:30",
            "type": "local"
        }
    ]
}
```

**Champs obligatoires :**
- `id` : Identifiant unique
- `title` : Titre affiché dans le bandeau
- `src` : Nom du fichier (ou ID YouTube si type="youtube")
- `duration` : Durée au format "MM:SS" ou "HH:MM:SS"
- `type` : "local" ou "youtube"

### 3️⃣ music.json - Liste des Musiques

```json
{
    "tracks": [
        {
            "id": "music_001",
            "title": "Jazz Doux - Ambiance Matinale",
            "src": "music/jazz_morning.mp3",
            "duration": "03:45"
        }
    ]
}
```

### 4️⃣ schedule.json - Événements Planifiés

```json
{
    "events": [
        {
            "id": "schedule_001",
            "title": "Météo Express du Matin",
            "time": "08:00",
            "video": {
                "title": "Météo du Jour",
                "src": "meteo_morning.mp4",
                "duration": "02:30",
                "type": "local"
            },
            "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "priority": 1
        }
    ]
}
```

**Champs spécifiques :**
- `time` : Format 24h "HH:MM" (ex: "08:00", "14:30")
- `days` : Tableau des jours actifs (en anglais)
- `priority` : 1 = haute priorité, 2 = normale

---

## 🎥 Utilisation avec OBS

### Configuration dans OBS Studio

1. **Ajouter une Source Navigateur :**
   - Cliquez sur `+` dans les Sources
   - Sélectionnez "Source Navigateur"

2. **Paramètres de la Source :**
   ```
   URL : file:///chemin/complet/vers/24-24/index.html
   Largeur : 1920
   Hauteur : 1080
   FPS : 30 (ou 60 pour plus de fluidité)
   ```

3. **Options Avancées (recommandées) :**
   - ☑️ Actualiser le navigateur quand la scène devient active
   - ☑️ Contrôler l'audio via OBS
   - ☑️ Arrêter les sons quand non visible

### Pour Tester en Local (Live Server)

1. Installer l'extension "Live Server" dans VS Code
2. Clic droit sur `index.html` → "Open with Live Server"
3. Le navigateur s'ouvre automatiquement
4. Ouvrir la console (F12) pour voir les logs si `debugMode: true`

### GitHub Pages

1. Commiter tous les fichiers dans votre repo
2. Aller dans Settings → Pages
3. Sélectionner la branche `main` et le dossier `/24-24`
4. L'URL sera : `https://votre-nom.github.io/ClubRadio_Mauleon/24-24/`

**⚠️ Important pour GitHub Pages :**
- Assurez-vous que `pathPrefix` dans `config.js` pointe vers le bon chemin
- Pour GitHub Pages : `pathPrefix: "../assets/"` ou `pathPrefix: "./assets/"` selon votre structure

---

## 📁 Structure des Fichiers

```
24-24/
│
├── index.html              # Structure HTML sémantique
│   ├── <video> principal   # Lecteur vidéo HTML5
│   ├── <audio> musique     # Lecteur audio invisible
│   ├── Bandeau ticker      # Informations défilantes
│   └── Overlays            # Indicateurs visuels
│
├── style.css               # Styles optimisés GPU
│   ├── Layout 1920x1080    # Dimensions OBS
│   ├── Animations          # Transitions fluides
│   └── Responsive          # Adaptation écran
│
├── app.js                  # Logique métier (900+ lignes)
│   ├── Gestion vidéos      # Lecture, erreurs, fallback
│   ├── Pauses musicales    # Calcul intervalles
│   ├── Planification       # Events horaires
│   ├── Bandeau intelligent # Logique des 30%
│   └── Optimisations       # Prévention fuites mémoire
│
├── config.js               # Configuration centralisée
│   ├── Intervalles         # Timings
│   ├── Chemins            # Paths relatifs
│   └── Options            # Flags de comportement
│
└── *.json                  # Données modifiables
    ├── playlist.json       # Vidéos principales
    ├── music.json          # Intercalaires
    └── schedule.json       # Events planifiés
```

---

## 🎨 Personnalisation

### Modifier les Couleurs

Dans [style.css](style.css), cherchez les couleurs principales :

```css
/* Couleur d'accent (bandeau, horloge) */
#00d4ff  → Remplacer par votre couleur

/* Fond du bandeau */
background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7));
```

### Changer la Police

Dans [style.css](style.css), ligne 14 :

```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### Ajuster la Vitesse du Ticker

Dans [config.js](config.js) :

```javascript
tickerSpeed: 50,  // pixels/seconde (augmenter = plus rapide)
```

### Modifier le Logo (optionnel)

Ajoutez une image dans [index.html](index.html) :

```html
<div class="logo">
    <img src="../assets/logo_clubradio.png" alt="ClubRadio">
</div>
```

---

## 🔧 Résolution de Problèmes

### ❌ Les vidéos ne se chargent pas

**Causes possibles :**
1. Chemin incorrect dans `config.js` (`pathPrefix`)
2. Fichiers manquants dans `../assets/`
3. Format vidéo non supporté (utiliser H.264/MP4)

**Solutions :**
```javascript
// Vérifier le pathPrefix dans config.js
pathPrefix: "../assets/"  // Chemin relatif à index.html

// Activer les logs
debugMode: true  // Dans config.js
```

### ❌ Le bandeau ne défile pas

**Vérifier :**
1. La classe `.ticker-message` a bien l'animation CSS
2. Le message n'est pas trop court (durée calculée automatiquement)
3. Pas d'erreur JavaScript dans la console (F12)

### ❌ Les pauses musicales ne fonctionnent pas

**Vérifier :**
1. Les fichiers MP3 existent dans `../assets/music/`
2. `musicIntervalMinutes` est bien défini dans `config.js`
3. Le format audio est supporté (préférer MP3)

### ❌ Les événements planifiés ne se déclenchent pas

**Vérifier :**
1. Le format de l'heure est correct : `"08:00"` (pas `"8:00"`)
2. Les jours sont en anglais : `"monday"` (pas `"lundi"`)
3. La tolérance `scheduleToleranceSeconds` n'est pas trop faible

### ❌ Fuite mémoire / Ralentissements après plusieurs heures

**Solutions :**
```javascript
// Dans config.js
cleanupVideosAfterPlay: true  // Nettoyer les ressources
maxRetryAttempts: 2           // Limiter les tentatives
```

### 🐛 Mode Debug

Pour activer les logs détaillés :

```javascript
// Dans config.js
debugMode: true
```

Puis ouvrir la console (F12) pour voir :
- Chargement des fichiers
- Lecture des vidéos
- Calculs des intervalles
- Erreurs détaillées

---

## 📝 Notes Techniques

### Performance
- **Vanilla JavaScript** : Pas de framework lourd
- **GPU Acceleration** : Animations CSS via `transform` et `opacity`
- **Memory Management** : Nettoyage automatique des ressources
- **Optimisé 24/7** : Testé pour fonctionner en continu

### Compatibilité
- Chrome/Edge : ✅ Parfait
- Firefox : ✅ Parfait
- Safari : ⚠️ Tester (certaines limitations vidéo)
- OBS Browser Source : ✅ Optimisé

### Formats Supportés
- **Vidéo** : MP4 (H.264), WebM
- **Audio** : MP3, OGG, WAV
- **YouTube** : Via IFrame API (nécessite internet)

---

## 🤝 Support

Pour toute question ou problème :
1. Vérifier la section [Résolution de Problèmes](#résolution-de-problèmes)
2. Activer le mode debug et consulter les logs
3. Vérifier que tous les fichiers sont au bon endroit

---

## 📄 Licence

Ce projet est développé pour ClubRadio Mauléon - Association sans but lucratif.

---

## 🎯 Checklist de Déploiement

- [ ] Tous les fichiers vidéo sont dans `../assets/`
- [ ] Les musiques sont dans `../assets/music/`
- [ ] Les chemins dans `playlist.json` et `music.json` sont corrects
- [ ] Le `pathPrefix` dans `config.js` est correct
- [ ] Les événements planifiés ont les bonnes heures
- [ ] Test en local avec Live Server : OK
- [ ] Test dans OBS : OK
- [ ] Laissé tourner 2-3 heures pour vérifier la stabilité
- [ ] Mode debug désactivé pour la production (`debugMode: false`)

---

**Créé avec ❤️ pour ClubRadio Mauléon**
