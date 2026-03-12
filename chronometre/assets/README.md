# 📁 Structure des Assets

Ce dossier doit contenir tous vos fichiers média (vidéos et musiques).

## 📂 Organisation Recommandée

```
assets/
├── presentation_clubradio.mp4
├── actualites_local.mp4
├── interview_semaine.mp4
├── reportage_asso.mp4
├── culture_patrimoine.mp4
├── sport_local.mp4
├── agenda_evenements.mp4
├── decouverte_territoire.mp4
├── meteo_morning.mp4
├── meteo_afternoon.mp4
├── meteo_night.mp4
├── flash_info_noon.mp4
├── journal_evening.mp4
├── weekly_summary.mp4
│
└── music/
    ├── jazz_morning.mp3
    ├── piano_relax.mp3
    ├── acoustic_journey.mp3
    ├── electro_chill.mp3
    ├── bossa_evening.mp3
    ├── lofi_focus.mp3
    ├── world_discovery.mp3
    ├── blues_night.mp3
    ├── synthwave_retro.mp3
    └── folk_french.mp3
```

## 🎬 Spécifications Vidéo Recommandées

### Format
- **Conteneur** : MP4
- **Codec vidéo** : H.264 (x264)
- **Codec audio** : AAC

### Résolution
- **Recommandé** : 1920x1080 (Full HD)
- **Alternative** : 1280x720 (HD)
- **Ratio** : 16:9

### Paramètres
- **Bitrate vidéo** : 5000-8000 kbps
- **Bitrate audio** : 128-192 kbps
- **Framerate** : 25 ou 30 fps

### Commande FFmpeg (pour convertir)
```bash
ffmpeg -i input.mov -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

## 🎵 Spécifications Audio Recommandées

### Format
- **Format** : MP3 (recommandé)
- **Alternative** : OGG, WAV

### Paramètres
- **Bitrate** : 128-192 kbps
- **Sample rate** : 44100 Hz
- **Channels** : Stéréo

### Commande FFmpeg (pour convertir)
```bash
ffmpeg -i input.wav -codec:a libmp3lame -b:a 192k output.mp3
```

## 📝 Notes Importantes

1. **Noms de fichiers** : 
   - Pas d'espaces (utiliser des underscores `_`)
   - Pas de caractères spéciaux (éviter les accents)
   - Exemple : `meteo_du_jour.mp4` ✅ (pas `Météo du Jour.mp4` ❌)

2. **Durées** :
   - Indiquer la durée exacte dans les fichiers JSON
   - Format : "MM:SS" ou "HH:MM:SS"

3. **Taille des fichiers** :
   - Optimiser pour le streaming (pas de fichiers trop lourds)
   - Utiliser `-movflags +faststart` avec FFmpeg pour le MP4

4. **Droits** :
   - Assurez-vous d'avoir les droits d'utilisation des contenus
   - Pour les musiques, privilégier les contenus libres de droits

## 🔍 Vérification

Pour vérifier qu'un fichier est bien encodé :

```bash
# Vérifier les informations d'une vidéo
ffprobe video.mp4

# Vérifier les informations d'un audio
ffprobe music.mp3
```

## 📦 Sources de Contenu Libre de Droits

### Musiques
- [Incompetech](https://incompetech.com/) - Musiques libres de Kevin MacLeod
- [Bensound](https://www.bensound.com/) - Musiques gratuites
- [Free Music Archive](https://freemusicarchive.org/) - Archive de musique libre

### Vidéos
- [Pexels Videos](https://www.pexels.com/videos/) - Vidéos libres de droits
- [Pixabay](https://pixabay.com/videos/) - Vidéos gratuites
- [Coverr](https://coverr.co/) - Vidéos HD gratuites

---

**⚠️ Ce dossier est essentiel au fonctionnement du système. Assurez-vous que tous les fichiers référencés dans les JSON existent ici.**
