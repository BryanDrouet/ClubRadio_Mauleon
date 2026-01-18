# ✅ Checklist de Déploiement - ClubRadio 24/7

Liste de vérification complète avant de mettre en production votre système 24h/24.

---

## 📋 Phase 1 : Préparation des Fichiers

### Fichiers Média

- [ ] **Vidéos préparées**
  - [ ] Format MP4 (H.264 + AAC)
  - [ ] Résolution 1920x1080 ou 1280x720
  - [ ] Tous les fichiers dans `assets/`
  - [ ] Noms sans espaces ni accents
  - [ ] Durées notées (format MM:SS)

- [ ] **Musiques préparées**
  - [ ] Format MP3 (ou OGG/WAV)
  - [ ] Bitrate 128-192 kbps
  - [ ] Tous les fichiers dans `assets/music/`
  - [ ] Noms sans espaces ni accents
  - [ ] Durées notées (format MM:SS)

### Structure des Dossiers

```
□ ClubRadio_Mauleon/
  □ 24-24/
    □ index.html
    □ style.css
    □ app.js
    □ config.js
    □ playlist.json
    □ music.json
    □ schedule.json
  □ assets/
    □ video1.mp4
    □ video2.mp4
    □ music/
      □ track1.mp3
      □ track2.mp3
```

---

## ⚙️ Phase 2 : Configuration

### config.js

- [ ] **pathPrefix** correctement défini
  ```javascript
  pathPrefix: "../assets/"  // ✅ Vérifier le chemin
  ```

- [ ] **musicIntervalMinutes** défini
  ```javascript
  musicIntervalMinutes: 20  // ✅ Votre intervalle souhaité
  ```

- [ ] **musicThresholdPercent** vérifié
  ```javascript
  musicThresholdPercent: 0.3  // ✅ 30% par défaut
  ```

- [ ] **debugMode** configuré
  ```javascript
  debugMode: true   // ✅ Pour les tests
  debugMode: false  // ✅ En production (après validation)
  ```

### playlist.json

- [ ] **Au moins 1 vidéo** dans la liste
- [ ] **Tous les champs** obligatoires présents :
  - [ ] id (unique)
  - [ ] title
  - [ ] src (nom exact du fichier)
  - [ ] duration (format MM:SS)
  - [ ] type (local ou youtube)

- [ ] **Syntaxe JSON** valide (vérifier sur jsonlint.com)
- [ ] **Chemins** correspondent aux fichiers réels

### music.json

- [ ] **Au moins 1 musique** dans la liste
  - ℹ️ *Peut être vide si vous ne voulez pas de pauses musicales*
  
- [ ] **Tous les champs** obligatoires présents
- [ ] **Syntaxe JSON** valide
- [ ] **Chemins** incluent le dossier `music/`

### schedule.json

- [ ] **Format des heures** correct : "HH:MM" (ex: "08:00")
- [ ] **Jours** en anglais minuscule :
  ```json
  ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  ```
- [ ] **Syntaxe JSON** valide
- [ ] **Priority** définie (1 ou 2)

---

## 🧪 Phase 3 : Tests Locaux

### Test Automatique

- [ ] **Ouvrir test.html** dans un navigateur
  ```
  24-24/test.html
  ```
- [ ] **Vérifier tous les tests** sont verts (✅)
- [ ] **Corriger les erreurs** si présentes (❌)
- [ ] **Noter les avertissements** (⚠️) et décider si OK

### Test Manuel

- [ ] **Ouvrir index.html** (avec Live Server ou navigateur)
- [ ] **Console ouverte** (F12) pour voir les logs
- [ ] **Première vidéo** démarre automatiquement
  - ℹ️ *Si blocage autoplay : cliquer sur la page*
  
- [ ] **Bandeau** défile correctement en bas
- [ ] **Horloge** s'actualise toutes les secondes
- [ ] **Titre** de la vidéo s'affiche brièvement en haut
- [ ] **Vidéo suivante** démarre après la première
- [ ] **Aucune erreur** dans la console (sauf warnings OK)

### Test des Pauses Musicales

**Option A : Attendre 20 minutes** (si musicIntervalMinutes: 20)

**Option B : Test rapide** (recommandé)
```javascript
// Dans config.js temporairement
musicIntervalMinutes: 0.5  // 30 secondes
```

- [ ] **Pause musicale** se déclenche après X minutes
- [ ] **Indicateur 🎵** apparaît en haut à gauche
- [ ] **Musique** joue correctement
- [ ] **Retour aux vidéos** après la musique

### Test du Bandeau (Logique 30%)

**Calculer le seuil :**
```
Intervalle = 20 min
Seuil 30% = 6 min

0 → 14 min restant : "Prochaine pause dans X minutes"
14 → 20 min : "À venir: [Titre prochaine vidéo]"
```

- [ ] **Message change** selon le temps restant
- [ ] **Logique respectée** (vérifier dans la console si besoin)

### Test des Events Planifiés

**Option A : Attendre l'heure définie**

**Option B : Test rapide** (recommandé)
```json
// Dans schedule.json, mettre un event dans 2 minutes
{
    "time": "14:32",  // ← Heure actuelle + 2 min
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}
```

- [ ] **Event se déclenche** à l'heure prévue
- [ ] **Vidéo de l'event** joue correctement
- [ ] **Retour à la playlist** après l'event

---

## 🎥 Phase 4 : Intégration OBS

### Configuration OBS

- [ ] **OBS Studio ouvert**
- [ ] **Nouvelle source** créée :
  - Type : "Source Navigateur"
  - Nom : "ClubRadio 24/7"

- [ ] **Paramètres de la source** :
  ```
  □ URL : file:///C:/chemin/complet/vers/24-24/index.html
       (Adapter selon votre système)
  □ Largeur : 1920
  □ Hauteur : 1080
  □ FPS : 30 (minimum) ou 60 (recommandé)
  □ ✅ Contrôler l'audio via OBS
  □ ✅ Actualiser quand la scène devient active
  ```

- [ ] **Audio configuré** :
  - [ ] Source pas mutée dans le mixer
  - [ ] Volume ajusté (environ -6 dB recommandé)

### Tests dans OBS

- [ ] **Vidéo visible** dans OBS
- [ ] **Audio audible** (vérifier le mixer)
- [ ] **Pas de lag** visible
- [ ] **Transitions fluides** entre contenus
- [ ] **Bandeau lisible** (taille police OK)

### Performance OBS

- [ ] **CPU < 20%** (pendant la lecture normale)
- [ ] **FPS stable** (60 ou 30 selon config)
- [ ] **Pas de dropped frames**

Si problèmes :
```
□ Baisser la résolution → 1280x720
□ Réduire le FPS → 30
□ Activer l'encodage matériel (NVENC/QuickSync)
□ Désactiver debugMode dans config.js
```

---

## 🚀 Phase 5 : Test Longue Durée

### Test 30 Minutes

- [ ] **Lancer le système**
- [ ] **Laisser tourner 30 minutes** sans intervention
- [ ] **Vérifier** :
  - [ ] Vidéos jouent en boucle
  - [ ] Pas de freeze
  - [ ] Pas de crash navigateur
  - [ ] Bandeau toujours actif
  - [ ] Horloge à jour

### Test 2 Heures (Recommandé)

- [ ] **Laisser tourner 2 heures**
- [ ] **Vérifier** :
  - [ ] Au moins une pause musicale OK
  - [ ] Mémoire RAM stable (pas d'augmentation continue)
  - [ ] CPU stable
  - [ ] Tout fonctionne toujours

### Test Overnight (Optionnel mais idéal)

- [ ] **Laisser tourner toute une nuit** (8+ heures)
- [ ] **Le matin, vérifier** :
  - [ ] Système toujours actif
  - [ ] Pas de problème visible
  - [ ] Logs propres (F12 console)

---

## 🔧 Phase 6 : Optimisation Production

### config.js Final

```javascript
// ✅ Configuration recommandée pour production
const CONFIG = {
    musicIntervalMinutes: 20,        // ← Votre valeur
    musicThresholdPercent: 0.3,
    debugMode: false,                // ⚠️ IMPORTANT : désactiver
    cleanupVideosAfterPlay: true,    // ⚠️ IMPORTANT : activer
    showLoadingIndicator: false,     // ← Optionnel (cacher en prod)
    // ... autres paramètres
};
```

### Nettoyage Final

- [ ] **Supprimer fichiers de test** (optionnel)
  ```bash
  □ test.html (optionnel, garder pour debug)
  □ Vidéos de test non utilisées
  ```

- [ ] **Vérifier .gitignore** (si GitHub)
  ```
  □ *.mp4 ignoré (sauf petits fichiers de test)
  □ *.mp3 ignoré
  ```

---

## 📊 Phase 7 : Monitoring

### Première Semaine

**Vérifier quotidiennement :**

- [ ] Jour 1 : Système fonctionne
- [ ] Jour 2 : Toujours stable
- [ ] Jour 3 : Pas de problème
- [ ] Jour 4 : OK
- [ ] Jour 5 : OK
- [ ] Jour 6 : OK
- [ ] Jour 7 : ✅ Validation complète !

### Checklist Quotidienne (Semaine 1)

- [ ] OBS actif et enregistre/streame
- [ ] Vidéos jouent correctement
- [ ] Pauses musicales OK
- [ ] Events planifiés se déclenchent
- [ ] Bandeau fonctionne
- [ ] Pas d'erreur dans les logs OBS

### Maintenance Hebdomadaire (Après validation)

- [ ] Vérifier l'état général (visite rapide)
- [ ] Ajouter nouvelles vidéos si besoin
- [ ] Mettre à jour les events planifiés
- [ ] Vider les logs si trop gros (optionnel)

---

## 🆘 Plan B : Procédure d'Urgence

Si problème critique en production :

### 1. Diagnostic Rapide

```
□ Ouvrir la console (F12 dans OBS Source Navigateur)
□ Chercher les erreurs rouges
□ Noter le message d'erreur exact
```

### 2. Solutions Rapides

**Problème : Vidéo ne charge pas**
```
→ Vérifier que le fichier existe
→ Recharger la source OBS (clic droit → Actualiser)
```

**Problème : Plus de son**
```
→ Vérifier le mixer OBS
→ Clic droit sur source → Contrôler l'audio via OBS
```

**Problème : Freeze complet**
```
→ Recharger la page (Ctrl+R dans le navigateur)
→ Ou recharger la source OBS
```

### 3. Redémarrage d'Urgence

```
1. Clic droit sur "Source Navigateur" dans OBS
2. Propriétés
3. Cliquer "Actualiser le cache de la page"
4. OK
```

Si ça ne suffit pas :
```
1. Supprimer la source
2. Recréer la source navigateur
3. Reconfigurer les paramètres
```

---

## 📝 Notes Finales

### Sauvegarde Recommandée

**Avant la mise en production :**

```bash
□ Copier tout le dossier 24-24/
□ Sauvegarder dans un lieu sûr
□ Noter la date de sauvegarde
□ Conserver les fichiers JSON configurés
```

### Contact Support

En cas de problème non résolu :

1. Consulter [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Activer `debugMode: true`
3. Copier les logs de la console
4. Chercher l'erreur sur Google/StackOverflow

---

## ✅ Validation Finale

**Tous les tests sont passés ?**

- ✅ Tests automatiques (test.html) : OK
- ✅ Tests manuels (lecture, bandeau, etc.) : OK
- ✅ Pauses musicales : OK
- ✅ Events planifiés : OK
- ✅ Intégration OBS : OK
- ✅ Test longue durée : OK
- ✅ Configuration optimisée : OK

**🎉 Félicitations ! Votre système ClubRadio 24/7 est prêt pour la production !**

---

## 🎯 Checklist Post-Déploiement

Après 1 semaine d'utilisation :

- [ ] Écrire un retour d'expérience
- [ ] Noter les améliorations possibles
- [ ] Partager votre expérience (si souhaité)
- [ ] Envisager des fonctionnalités supplémentaires

---

**Date de validation** : ________________

**Responsable** : ________________

**Signature** : ________________

---

**Document créé pour ClubRadio Mauléon**  
**Version 1.0 - Janvier 2026**
