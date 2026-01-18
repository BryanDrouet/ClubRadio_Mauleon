# 📝 Changelog - ClubRadio 24/7

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

---

## [1.0.0] - 2026-01-18

### 🎉 Version Initiale

#### ✨ Fonctionnalités

**Lecture Vidéo**
- Lecture en boucle automatique de vidéos locales (MP4)
- Support des vidéos YouTube via IFrame API
- Gestion avancée des erreurs avec retry automatique (configurable)
- Transitions fluides entre les contenus
- Nettoyage automatique des ressources pour éviter les fuites mémoire

**Pauses Musicales**
- Insertion automatique de pauses musicales à intervalles réguliers
- Mode aléatoire ou séquentiel pour la sélection des musiques
- Ne coupe jamais une vidéo en cours (attend toujours la fin)
- Durée maximale configurable pour les pauses
- Indicateur visuel pendant les pauses musicales

**Planification Horaire**
- Événements déclenchés à des heures fixes
- Configuration par jour de la semaine
- Système de priorités
- Tolérance de déclenchement configurable
- Mode interruption : "wait" ou "fade"

**Bandeau d'Information (Ticker)**
- Défilement fluide avec animation GPU-accelerated
- **Logique des 30%** :
  - Temps restant > 30% → "Prochaine pause dans X minutes"
  - Temps restant ≤ 30% → Titre de la prochaine vidéo/événement
- Horloge en temps réel
- Affichage du contenu en cours avec animation

**Interface**
- Design moderne et professionnel
- Optimisé pour OBS Studio (1920x1080)
- Responsive pour tests en local
- Indicateurs de chargement et d'erreur
- Overlays semi-transparents avec backdrop-filter

#### 🛠️ Architecture

**Fichiers**
- `index.html` : Structure HTML5 sémantique
- `style.css` : CSS3 avec animations GPU (450+ lignes)
- `app.js` : Logique métier en Vanilla JavaScript (900+ lignes)
- `config.js` : Configuration centralisée (200+ lignes de documentation)
- `playlist.json` : Données des vidéos
- `music.json` : Données des musiques
- `schedule.json` : Événements planifiés

**Performance**
- Vanilla JavaScript (pas de framework lourd)
- GPU acceleration pour les animations
- Gestion proactive de la mémoire
- Optimisé pour fonctionner 24h/24 et 7j/7

#### 📚 Documentation

- `README.md` : Documentation complète (500+ lignes)
- `QUICKSTART.md` : Guide de démarrage rapide
- `TROUBLESHOOTING.md` : Guide de dépannage détaillé
- `assets/README.md` : Spécifications des fichiers média
- Commentaires français exhaustifs dans tout le code

#### ⚙️ Configuration

**Paramètres Modifiables (config.js)**
- Intervalle des pauses musicales
- Seuil d'affichage du bandeau (30%)
- Durée maximale des pauses
- Mode de sélection des musiques (random/sequential)
- Comportement d'interruption des événements planifiés
- Chemins des fichiers
- Timeouts et retry
- Options d'interface
- Support YouTube
- Mode debug

#### 🎨 Personnalisation

**Styles**
- Couleurs modifiables (accent, fond, textes)
- Police personnalisable
- Vitesse du ticker ajustable
- Animations activables/désactivables

**Comportement**
- Tous les délais configurables
- Gestion d'erreur paramétrable
- Logs activables/désactivables

#### 🐛 Gestion d'Erreurs

- Timeout de chargement vidéo configurable
- Retry automatique avec limite
- Fallback vers la vidéo suivante en cas d'échec
- Messages d'erreur clairs pour l'utilisateur
- Logs détaillés en mode debug
- Protection contre les vidéos corrompues

#### 📊 Statistiques

- **Lignes de code** : ~2000+
- **Commentaires** : ~30% du code
- **Fichiers de documentation** : 5
- **Paramètres configurables** : 25+
- **Fonctions JavaScript** : 40+

---

## 🔮 Prochaines Versions (Roadmap)

### [1.1.0] - Prévu

**Fonctionnalités Envisagées**
- [ ] API REST pour modification en temps réel
- [ ] Interface web de configuration
- [ ] Support des flux RTMP en direct
- [ ] Statistiques de visionnage
- [ ] Mode maintenance automatique

**Améliorations**
- [ ] Support WebM et autres formats
- [ ] Préchargement intelligent des vidéos
- [ ] Transitions personnalisables (fade, slide, etc.)
- [ ] Thèmes de couleurs prédéfinis

**Optimisations**
- [ ] Compression automatique des logs
- [ ] Mode économie d'énergie
- [ ] Cache intelligent pour les événements

### [1.2.0] - Prévu

**Nouvelles Fonctionnalités**
- [ ] Support multi-langue
- [ ] Sous-titres automatiques
- [ ] Intégration réseaux sociaux (Twitter feed, etc.)
- [ ] Météo en temps réel (API)
- [ ] Actualités automatiques (RSS)

### [2.0.0] - Futur

**Architecture**
- [ ] Refonte en TypeScript (optionnel)
- [ ] API GraphQL
- [ ] Base de données pour l'historique
- [ ] Dashboard d'administration

---

## 📋 Format

Ce changelog suit les conventions de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

### Types de Changements

- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔄 Modifié` : Changements dans les fonctionnalités existantes
- `🗑️ Déprécié` : Fonctionnalités bientôt retirées
- `🚫 Supprimé` : Fonctionnalités retirées
- `🐛 Corrigé` : Corrections de bugs
- `🔒 Sécurité` : Correctifs de sécurité

---

## 🤝 Contributions

Pour proposer une nouvelle fonctionnalité :
1. Vérifier qu'elle n'est pas déjà dans la roadmap
2. Documenter le besoin et l'usage
3. Proposer une implémentation si possible

---

## 📜 Licence

Ce projet est développé pour ClubRadio Mauléon - Association sans but lucratif.

---

**Dernière mise à jour** : 18 janvier 2026
