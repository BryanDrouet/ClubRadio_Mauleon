# 🎙️ 60 Secondes - Timer pour ClubRadio Mauléon

Timer animé de 60 secondes pour les émissions radio avec contrôle à distance via Firebase.

## 🌟 Fonctionnalités

### Version locale (index.html)
- ⏱️ Timer 60 secondes avec millisecondes
- 🎨 Animations de bordure progressive
- 🌊 Fond animé avec gradients fluides
- ⚠️ Alertes visuelles (warning à 10s, danger à 5s)
- ⏸️ Contrôles : Start, Pause, Stop, Reset
- ⚙️ Panneau de configuration intégré
- 🔊 Sons système pour les alertes
- 📱 Responsive design

### Version Firebase (overlay.html + dashboard.html)
- 🌐 **Contrôle à distance** depuis n'importe quel appareil
- 🔄 **Synchronisation temps réel** entre overlay et dashboard
- 🔐 **Authentification sécurisée** pour le dashboard
- 📺 **Overlay OBS** sans authentification
- 📱 **Interface mobile** pour le contrôle
- ⚙️ **Configuration en temps réel**

## 🚀 Démarrage rapide

### Option 1 : Version locale (simple)
1. Ouvrez `index.html` dans votre navigateur
2. C'est tout ! Utilisez les contrôles en bas de page

### Option 2 : Version Firebase (contrôle à distance)
1. Suivez le guide : [QUICKSTART-FIREBASE.md](QUICKSTART-FIREBASE.md)
2. Configurez Firebase (5 minutes)
3. Déployez sur GitHub Pages
4. Contrôlez depuis n'importe où !

## 📺 Utilisation dans OBS

### Version locale
1. Source → Navigateur
2. Cochez "Page locale"
3. Sélectionnez `index.html`
4. Dimensions : 1920x1080

### Version Firebase
1. Source → Navigateur
2. URL : `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html`
3. Dimensions : 1920x1080

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| [FIREBASE-README.md](FIREBASE-README.md) | Vue d'ensemble du système Firebase |
| [QUICKSTART-FIREBASE.md](QUICKSTART-FIREBASE.md) | Guide de démarrage rapide (5 min) |
| [FIREBASE-SETUP.md](FIREBASE-SETUP.md) | Guide complet de configuration |
| [ARCHITECTURE-FIREBASE.md](ARCHITECTURE-FIREBASE.md) | Documentation technique détaillée |

## 🔧 Configuration

### Personnalisation visuelle
Éditez `config.js` pour modifier :
- Durée du timer
- Seuils d'alerte (warning/danger)
- Couleurs des bordures
- Couleurs du fond
- Vitesse des animations
- Taille et style des gradients

### Exemple
```javascript
const CONFIG = {
    countdownDuration: 90,        // 90 secondes au lieu de 60
    warningThreshold: 15,         // Alerte à 15s
    dangerThreshold: 8,           // Danger à 8s
    borderColor1: '#ff0000',      // Bordure rouge
    // ...
};
```

## 📁 Structure des fichiers

```
60secondes/
├── index.html                    # Version locale complète
├── overlay.html                  # Overlay OBS (Firebase)
├── dashboard.html                # Dashboard de contrôle (Firebase)
├── config.js                     # Configuration partagée
├── firebase-config.js            # Config Firebase (à créer)
├── firebase-config.example.js    # Exemple de configuration
├── database.rules.json           # Règles de sécurité Firebase
├── test-firebase.html            # Test de connexion Firebase
├── FIREBASE-README.md            # Documentation Firebase
├── QUICKSTART-FIREBASE.md        # Guide rapide
├── FIREBASE-SETUP.md             # Guide complet
├── ARCHITECTURE-FIREBASE.md      # Documentation technique
├── TODO.md                       # Liste des tâches
└── assets/                       # Polices et images
    ├── icon.png
    ├── Poppins-Regular.ttf
    ├── Poppins-Italic.ttf
    └── AzeretMono-VariableFont_wght.ttf
```

## 🎯 Cas d'usage

### En studio
```
[OBS] ← overlay.html ← Firebase ← dashboard.html ← [Tablette animateur]
```
L'animateur contrôle le timer depuis sa tablette sans toucher l'ordinateur OBS.

### En émission externe
```
[Laptop OBS] ← overlay.html ← Firebase ← dashboard.html ← [Smartphone régie]
```
La régie contrôle à distance le timer visible sur l'écran OBS.

### Utilisation simple
```
[OBS] ← index.html (contrôles intégrés)
```
Tout en un, pas besoin de Firebase.

## 🛠️ Technologies

- **HTML5/CSS3** : Interface et animations
- **JavaScript** : Logique du timer
- **Firebase Realtime Database** : Synchronisation temps réel
- **Firebase Authentication** : Sécurité du dashboard
- **GitHub Pages** : Hébergement gratuit

## 🔐 Sécurité Firebase

- 🔓 **Overlay** : Lecture publique (pas d'auth)
- 🔒 **Dashboard** : Authentification obligatoire
- ✅ **Règles** : Écriture réservée aux utilisateurs connectés

## 📱 Compatibilité

### Navigateurs
- ✅ Chrome/Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)

### OBS
- ✅ OBS Studio 28+
- ✅ Streamlabs OBS
- ✅ XSplit

## 🎨 Modes d'affichage

### Mode normal
- Affichage en secondes avec millisecondes
- Timer : 60 → 59 → ... → 1 → Overtime

### Mode écran d'attente
- Affichage en minutes:secondes
- Timer : 1:00 → 0:59 → ... → 0:01 → 0:00 (clignotant)
- Pas d'overtime

## 🆘 Support

### Problème avec la version locale
→ Ouvrez la console du navigateur (F12) pour voir les erreurs

### Problème avec la version Firebase
→ Utilisez `test-firebase.html` pour diagnostiquer

### Documentation
→ Consultez les fichiers FIREBASE-*.md

## 🎉 Contribuer

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Poussez (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 Changelog

### v2.0 (2026-01-20)
- ✨ Ajout du contrôle à distance via Firebase
- ✨ Dashboard web responsive
- ✨ Synchronisation temps réel
- ✨ Authentification sécurisée
- 📚 Documentation complète

### v1.0
- 🎉 Version initiale locale
- ⏱️ Timer 60 secondes
- 🎨 Animations de bordure
- 🌊 Fond animé

## 📄 Licence

Voir [LICENSE.md](../24-24/LICENSE.md)

## 👥 Auteurs

**ClubRadio Mauléon**
- Site web : [clubradio.mauleon.fr](https://clubradio.mauleon.fr)
- Email : clubradio.mauleon@gmail.com

---

**Made with ❤️ for ClubRadio Mauléon**
