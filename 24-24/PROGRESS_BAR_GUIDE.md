# Guide d'utilisation - Barre de progression vidéo

## Vue d'ensemble

La nouvelle barre de progression s'affiche **au-dessus** du conteneur vidéo principal (1920x1080) et montre:
- Le titre de la vidéo en cours
- Le temps écoulé / durée totale
- Le temps restant
- Une barre de progression visuelle

## Configuration OBS

### Étape 1: Ajouter la source navigateur

1. Dans OBS, ajoutez une source **"Navigateur"**
2. Configurez les paramètres:
   - **URL**: `file:///chemin/vers/24-24/index.html` (chemin absolu)
   - **Largeur**: `1920`
   - **Hauteur**: `1150` (ou `1080` si vous ne voulez pas voir la barre)
   - **Rafraîchir le cache**: Coché
   - **FPS personnalisé**: 30

### Étape 2: Positionner la source

Si vous voulez voir la barre de progression:
- Positionnez la source en haut de votre scène
- La zone 0-70px contiendra la barre de progression
- La zone 70-1150px contiendra la vidéo 1920x1080

Si vous ne voulez PAS voir la barre:
- Réglez la hauteur sur `1080`
- Positionnez à `y=70` pour ignorer la barre

## Utilisation des URLs YouTube

Dans votre fichier `playlist.json`, vous pouvez maintenant utiliser:

### Format 1: URL complète standard
```json
{
  "id": "video1",
  "title": "Ma vidéo YouTube",
  "type": "youtube",
  "src": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Format 2: URL courte youtu.be
```json
{
  "id": "video2",
  "title": "Vidéo courte",
  "type": "youtube",
  "src": "https://youtu.be/dQw4w9WgXcQ"
}
```

### Format 3: URL live
```json
{
  "id": "video3",
  "title": "Stream en direct",
  "type": "youtube",
  "src": "https://www.youtube.com/live/dQw4w9WgXcQ"
}
```

### Format 4: ID seulement (comme avant)
```json
{
  "id": "video4",
  "title": "ID direct",
  "type": "youtube",
  "src": "dQw4w9WgXcQ"
}
```

## Comportement de la barre

### Quand elle s'affiche
- ✅ Pendant la lecture d'une vidéo (locale ou YouTube)
- ✅ Pendant les événements planifiés

### Quand elle est masquée
- ❌ Pendant les pauses musicales
- ❌ Pendant le chargement initial

### Mise à jour
- La barre se met à jour **toutes les secondes**
- Compatible avec vidéos locales ET YouTube
- Le temps est formaté automatiquement (MM:SS ou HH:MM:SS)

## Personnalisation visuelle

Vous pouvez modifier l'apparence dans `style.css`:

### Couleurs
```css
.progress-bar {
    background: rgba(0, 0, 0, 0.8);  /* Fond de la barre */
}

.progress-fill {
    background: linear-gradient(90deg, #ff0066, #ff6600);  /* Couleur de progression */
}
```

### Tailles
```css
.progress-bar {
    height: 70px;  /* Hauteur totale de la zone */
}

.video-title {
    font-size: 18px;  /* Taille du titre */
}

.video-time {
    font-size: 14px;  /* Taille des temps */
}
```

### Position
```css
.progress-bar {
    top: 0;  /* Position verticale */
    z-index: 100;  /* Ordre d'affichage */
}
```

## Troubleshooting

### La barre ne s'affiche pas
1. Vérifiez que la hauteur OBS est >= 1150px
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a pas d'erreurs JavaScript
4. Vérifiez que `config.js` a `debugMode: true` pour voir les logs

### Les temps ne se mettent pas à jour
1. Vérifiez que la vidéo est bien en cours de lecture
2. Ouvrez la console et cherchez les messages de log
3. Vérifiez que `APP_STATE.currentVideo` n'est pas `null`

### Les URLs YouTube ne fonctionnent pas
1. Vérifiez que `enableYouTube: true` dans `config.js`
2. Vérifiez que l'API YouTube est chargée (console: rechercher "YouTube API")
3. Testez avec un ID direct d'abord pour isoler le problème
4. Vérifiez le format de l'URL (doit contenir 11 caractères alphanumériques)

### La barre est décalée
1. Vérifiez que `#obs-container` a bien `margin-top: 70px` dans le CSS
2. Vérifiez que `.progress-bar` a `position: fixed; top: 0;`
3. Rechargez la page avec Ctrl+F5 pour vider le cache

## Fichiers de log

En mode debug (`debugMode: true`), vous verrez dans la console:

```
[14:23:45] 🎬 Chargement YouTube: Ma vidéo
[14:23:46] ✅ Tracking de progression démarré
[14:23:47] Titre: Ma vidéo | 00:02 / 05:12 | -05:10
```

## Support

Si vous rencontrez des problèmes:
1. Lisez [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Vérifiez [ARCHITECTURE.md](ARCHITECTURE.md) pour comprendre le fonctionnement
3. Consultez [CHANGES.md](CHANGES.md) pour voir ce qui a été modifié
