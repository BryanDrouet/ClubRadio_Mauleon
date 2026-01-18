# 🚀 Démarrage Rapide - ClubRadio 24/7

Guide ultra-rapide pour mettre en route le système en 5 minutes.

## 📋 Checklist Avant de Commencer

- [ ] J'ai des fichiers vidéo MP4
- [ ] J'ai des fichiers audio MP3
- [ ] J'ai un navigateur moderne (Chrome/Firefox/Edge)
- [ ] J'ai OBS Studio installé (optionnel pour les tests)

---

## 🎯 Étapes Rapides

### 1️⃣ Préparer les Médias (2 min)

```bash
# Placez vos fichiers dans cette structure :
assets/
├── ma_video_1.mp4
├── ma_video_2.mp4
└── music/
    ├── ma_musique_1.mp3
    └── ma_musique_2.mp3
```

### 2️⃣ Configurer les Listes (2 min)

#### A. Éditer `playlist.json`

```json
{
    "videos": [
        {
            "id": "video_001",
            "title": "Ma Première Vidéo",
            "src": "ma_video_1.mp4",
            "duration": "03:00",
            "type": "local"
        },
        {
            "id": "video_002",
            "title": "Ma Deuxième Vidéo",
            "src": "ma_video_2.mp4",
            "duration": "02:30",
            "type": "local"
        }
    ]
}
```

#### B. Éditer `music.json`

```json
{
    "tracks": [
        {
            "id": "music_001",
            "title": "Ma Musique 1",
            "src": "music/ma_musique_1.mp3",
            "duration": "03:30"
        },
        {
            "id": "music_002",
            "title": "Ma Musique 2",
            "src": "music/ma_musique_2.mp3",
            "duration": "04:00"
        }
    ]
}
```

### 3️⃣ Ajuster les Paramètres (1 min)

Ouvrir `config.js` et modifier si besoin :

```javascript
const CONFIG = {
    musicIntervalMinutes: 20,      // Pause musicale toutes les 20 min
    pathPrefix: "../assets/",      // Chemin vers vos médias
    debugMode: true,               // Voir les logs (mettre false en prod)
    // ... autres paramètres OK par défaut
};
```

### 4️⃣ Tester en Local

**Option A : Live Server (VS Code)**
1. Clic droit sur `index.html`
2. "Open with Live Server"
3. Le navigateur s'ouvre automatiquement

**Option B : Navigateur Directement**
1. Ouvrir `index.html` avec votre navigateur
2. Accepter la lecture automatique si demandé

### 5️⃣ Intégrer dans OBS

1. Ouvrir OBS Studio
2. Sources → `+` → "Source Navigateur"
3. Paramètres :
   ```
   URL : file:///C:/chemin/vers/24-24/index.html
   Largeur : 1920
   Hauteur : 1080
   FPS : 30
   ```
4. ✅ Cocher "Contrôler l'audio via OBS"
5. Cliquer OK

---

## ⚡ Résultats Attendus

### ✅ Ce que vous devriez voir :

1. **Vidéo** joue en boucle
2. **Bandeau** en bas avec l'heure et les infos
3. **Titre** de la vidéo s'affiche brièvement en haut
4. **Pause musicale** toutes les 20 minutes (configurable)
5. **Logs** dans la console (F12) si debugMode=true

### ❌ Si ça ne marche pas :

**Vidéo ne charge pas ?**
```javascript
// Vérifier dans config.js :
pathPrefix: "../assets/"  // Chemin correct ?
debugMode: true           // Activer pour voir les erreurs
```

**Console d'erreurs (F12) :**
```
❌ 404 Not Found → Fichier introuvable
❌ Invalid source → Mauvais chemin dans JSON
✅ Lecture démarrée → Tout va bien !
```

---

## 🎛️ Configuration Minimale

Pour un test rapide, vous n'avez besoin que de :

### Fichiers Obligatoires
```
24-24/
├── index.html        ✅ Ne pas modifier
├── style.css         ✅ Ne pas modifier
├── app.js            ✅ Ne pas modifier
├── config.js         🔧 Personnaliser
├── playlist.json     🔧 Vos vidéos
├── music.json        🔧 Vos musiques
└── schedule.json     ⚠️ Optionnel (events planifiés)
```

### Médias Minimums
```
assets/
├── au_moins_1_video.mp4
└── music/
    └── au_moins_1_musique.mp3
```

---

## 🔧 Personnalisation Rapide

### Changer l'Intervalle des Pauses

```javascript
// Dans config.js
musicIntervalMinutes: 15,  // Au lieu de 20
```

### Désactiver les Pauses Musicales

```javascript
// Dans config.js
musicIntervalMinutes: 999999,  // Très grand nombre = jamais
```

### Désactiver les Events Planifiés

```json
// Dans schedule.json
{
    "events": []  // Liste vide = pas d'events
}
```

---

## 📊 Exemple de Timeline

Voici ce qui se passe avec la config par défaut :

```
00:00 - Vidéo 1 (3 min)
03:00 - Vidéo 2 (2.5 min)
05:30 - Vidéo 3 (4 min)
09:30 - Vidéo 4 (3 min)
12:30 - Vidéo 5 (2 min)
14:30 - Vidéo 6 (5 min)
19:30 - Vidéo 7 (3 min)
20:00 - 🎵 PAUSE MUSICALE (3-4 min)
23:30 - Vidéo 8 (retour au début)
...
```

---

## 🆘 Aide Rapide

### Commandes Utiles

**Voir les logs détaillés :**
- Ouvrir la console : `F12` (Chrome/Edge/Firefox)
- Chercher les messages `[HH:MM:SS]`

**Recharger la page :**
- `Ctrl + R` (ou `Cmd + R` sur Mac)
- `Ctrl + Shift + R` pour forcer le reload du cache

**Tester un fichier spécifique :**
```javascript
// Dans la console du navigateur :
console.log(CONFIG.pathPrefix + 'ma_video.mp4');
// Copier l'URL complète et la tester dans le navigateur
```

### Problèmes Fréquents

| Symptôme | Cause Probable | Solution |
|----------|----------------|----------|
| Écran noir | Chemin incorrect | Vérifier `pathPrefix` dans config.js |
| Pas de son | Muted dans le navigateur | Clic droit sur l'onglet → Réactiver le son |
| Bandeau ne bouge pas | CSS non chargé | Recharger la page (Ctrl+R) |
| Vidéo saute | Fichier corrompu | Réencoder avec FFmpeg |

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- [README.md](README.md) - Documentation complète
- [config.js](config.js) - Tous les paramètres expliqués
- [assets/README.md](../assets/README.md) - Spécifications des médias

---

## ✅ Checklist Finale

Avant de laisser tourner 24/7 :

- [ ] Testé avec au moins 3 vidéos
- [ ] Pause musicale fonctionne
- [ ] Bandeau défile correctement
- [ ] Horloge s'actualise
- [ ] Pas d'erreur dans la console (F12)
- [ ] Laissé tourner 30 minutes sans problème
- [ ] Désactivé le mode debug (`debugMode: false`)

---

**🎉 Félicitations ! Votre système ClubRadio 24/7 est opérationnel !**

Pour toute question, consultez la [documentation complète](README.md).
