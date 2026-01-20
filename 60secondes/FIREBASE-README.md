# 🎙️ ClubRadio Mauléon - Système 60 Secondes avec Firebase

## 🆕 Nouveauté : Version en ligne avec contrôle à distance

Le système 60 Secondes dispose maintenant de **3 versions** :

### 1. Version locale (index.html)
- ✅ Fonctionne hors ligne
- ✅ Tout en un seul fichier
- ✅ Panneau de configuration intégré
- ❌ Pas de contrôle à distance

### 2. Version Firebase - Overlay OBS (overlay.html)
- ✅ Affichage pour OBS Studio
- ✅ Synchronisation en temps réel
- ✅ Pas besoin d'authentification
- ✅ Mise à jour automatique depuis le dashboard
- 📺 URL : https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html

### 3. Version Firebase - Dashboard (dashboard.html)
- ✅ Contrôle à distance du timer
- ✅ Configuration en temps réel
- ✅ Accessible depuis n'importe quel appareil
- 🔐 Authentification requise (clubradio.mauleon@gmail.com)
- 📱 URL : https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/dashboard.html

## 🚀 Démarrage rapide

### Première installation (une seule fois)

1. **Configurer Firebase** (5 minutes)
   - Suivez le guide : `60secondes/FIREBASE-SETUP.md`
   - Créez un projet Firebase
   - Configurez l'authentification
   - Mettez à jour `firebase-config.js`

2. **Déployer sur GitHub Pages**
   ```bash
   git add .
   git commit -m "Configuration Firebase"
   git push origin main
   ```

3. **Configurer OBS**
   - Ajoutez une source Navigateur
   - URL : https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html
   - Dimensions : 1920x1080

### Utilisation quotidienne

1. **Ouvrez le dashboard** sur votre appareil
   - PC, tablette ou smartphone
   - https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/dashboard.html

2. **Connectez-vous**
   - Email : clubradio.mauleon@gmail.com
   - Mot de passe : [votre mot de passe Firebase]

3. **Contrôlez le timer**
   - Démarrer, Pause, Stop, Reset
   - Modifier la configuration
   - Tout se met à jour automatiquement dans OBS !

## 📁 Structure des fichiers

```
60secondes/
├── index.html                    # Version locale autonome
├── overlay.html                  # Overlay OBS (Firebase)
├── dashboard.html                # Contrôle à distance (Firebase)
├── config.js                     # Configuration de base
├── firebase-config.js            # Configuration Firebase (à personnaliser)
├── database.rules.json           # Règles de sécurité Firebase
├── test-firebase.html            # Outil de test de connexion
├── FIREBASE-SETUP.md             # Guide complet de configuration
├── QUICKSTART-FIREBASE.md        # Guide de démarrage rapide
├── ARCHITECTURE-FIREBASE.md      # Documentation technique
├── FIREBASE-README.md            # Ce fichier
└── assets/                       # Polices, images, etc.
```

## 🎯 Cas d'usage

### Cas 1 : Utilisation en studio avec contrôle à distance
```
[OBS Studio] ←─ overlay.html ←─┐
                                ├─ Firebase ←─ dashboard.html ←─ [Tablette/Phone]
[Régie technique] ──────────────┘
```

**Avantages** :
- Contrôle depuis n'importe où dans le studio
- Pas besoin de revenir à l'ordinateur OBS
- Configuration à la volée

### Cas 2 : Utilisation locale simple
```
[OBS Studio] ←─ index.html (tout en un)
```

**Avantages** :
- Pas besoin d'internet
- Pas de configuration Firebase
- Plus simple pour débuter

## 🔐 Sécurité

### Qui peut faire quoi ?

| Action | Overlay (OBS) | Dashboard |
|--------|--------------|-----------|
| Voir le timer | ✅ Public | ✅ Connecté |
| Démarrer/Stop | ❌ | ✅ Connecté |
| Configurer | ❌ | ✅ Connecté |

### Protéger votre compte

- ✅ Utilisez un mot de passe fort
- ✅ Ne partagez pas vos identifiants
- ✅ Déconnectez-vous après usage sur appareils publics

## 📱 Compatibilité

### Dashboard
- ✅ PC/Mac (tous navigateurs modernes)
- ✅ Tablette (iPad, Android)
- ✅ Smartphone (iPhone, Android)
- ✅ Interface responsive

### Overlay OBS
- ✅ OBS Studio (Windows, Mac, Linux)
- ✅ Streamlabs OBS
- ✅ XSplit (comme source web)

## 🔧 Dépannage rapide

### L'overlay ne se connecte pas
```bash
# Ouvrez le fichier de test
# https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/test-firebase.html
# Vérifiez que tout est vert ✓
```

### Impossible de se connecter au dashboard
- Vérifiez votre email : clubradio.mauleon@gmail.com
- Vérifiez le mot de passe
- Vérifiez que l'utilisateur existe dans Firebase Authentication

### Les changements ne s'affichent pas
- Actualisez la page (F5)
- Dans OBS : clic droit sur la source → Actualiser
- Vérifiez votre connexion internet

### Documentation complète
- Configuration : `FIREBASE-SETUP.md`
- Architecture : `ARCHITECTURE-FIREBASE.md`
- Démarrage rapide : `QUICKSTART-FIREBASE.md`

## 🎨 Personnalisation

Modifiez `config.js` pour changer :
```javascript
const CONFIG = {
    countdownDuration: 60,        // Durée en secondes
    warningThreshold: 10,         // Seuil d'alerte
    dangerThreshold: 5,           // Seuil de danger
    borderColor1: '#5a2d81',      // Couleurs
    // ... et bien plus
};
```

## 📊 Statistiques Firebase (plan gratuit)

- ✅ 100 connexions simultanées
- ✅ 10 GB de bande passante/mois
- ✅ 1 GB de stockage
- ✅ **LARGEMENT SUFFISANT pour ce projet**

## 🆘 Support

### Documentation
1. `QUICKSTART-FIREBASE.md` - Démarrage en 5 minutes
2. `FIREBASE-SETUP.md` - Guide complet
3. `ARCHITECTURE-FIREBASE.md` - Détails techniques
4. `test-firebase.html` - Outil de diagnostic

### Contact
Pour toute question, contactez l'équipe technique de ClubRadio Mauléon.

## ✅ Checklist de déploiement

- [ ] Firebase configuré
- [ ] `firebase-config.js` personnalisé
- [ ] Utilisateur créé (clubradio.mauleon@gmail.com)
- [ ] Règles de sécurité configurées
- [ ] Test réussi avec `test-firebase.html`
- [ ] Code poussé sur GitHub
- [ ] GitHub Pages activé
- [ ] Overlay testé dans OBS
- [ ] Dashboard testé sur mobile
- [ ] Mot de passe enregistré en lieu sûr

## 🎉 Prêt à l'emploi !

Une fois configuré, vous pouvez :
- 📺 Afficher le timer dans OBS
- 📱 Contrôler depuis votre smartphone
- 💻 Configurer depuis votre tablette
- 🎛️ Modifier en temps réel

Le tout **synchronisé automatiquement** !

---

**ClubRadio Mauléon** - Système 60 Secondes v2.0 avec Firebase
