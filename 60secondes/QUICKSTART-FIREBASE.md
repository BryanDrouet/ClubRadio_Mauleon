# 🚀 Guide de Démarrage Rapide - Version Firebase

## 📋 Résumé

Vous avez maintenant **3 fichiers principaux** :

1. **overlay.html** - Pour afficher dans OBS (lecture seule, synchronisé en temps réel)
2. **dashboard.html** - Pour contrôler à distance (nécessite connexion)
3. **index.html** - Version locale autonome (sans Firebase)

## ⚡ Installation Rapide (5 minutes)

### Étape 1 : Configuration Firebase

1. Allez sur https://console.firebase.google.com/
2. Créez un projet "ClubRadio-60Secondes"
3. Activez **Authentication** → Google Sign-In
4. Activez **Realtime Database** en mode test
5. Copiez votre configuration Firebase

**Note** : Seuls bryan.drouet24@gmail.com et clubradio.mauleon@gmail.com peuvent contrôler le dashboard.

### Étape 2 : Mise à jour du fichier

Ouvrez `firebase-config.js` et remplacez par votre configuration :

```javascript
const firebaseConfig = {
    apiKey: "VOTRE_CLE_ICI",
    authDomain: "votre-projet.firebaseapp.com",
    databaseURL: "https://votre-projet.firebaseio.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### Étape 3 : Test local

1. Ouvrez `test-firebase.html` dans votre navigateur
2. Vérifiez que tout est vert ✓
3. Si erreur, vérifiez votre configuration

### Étape 4 : Déploiement GitHub Pages

```bash
git add .
git commit -m "Ajout version Firebase 60 secondes"
git push origin main
```

Attendez 2-3 minutes, puis vos pages seront disponibles :

- **Dashboard** : https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/dashboard.html
- **Overlay** : https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html

## 🎯 Utilisation

### Dans OBS Studio

1. Source → Navigateur
2. URL : `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html`
3. Dimensions : 1920x1080
4. OK !

### Sur votre téléphone/tablette/PC

1. Ouvrez : `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/dashboard.html`
2. Cliquez sur "Se connecter avec Google"
3. Choisissez votre compte (bryan.drouet24@gmail.com ou clubradio.mauleon@gmail.com)
4. Contrôlez le timer à distance !

## 🎛️ Fonctionnalités

### Dashboard (Contrôle)
- ▶️ **Démarrer** : Lance le chronomètre
- ⏸️ **Pause** : Met en pause
- ▶️ **Reprendre** : Reprend après une pause
- ⏹️ **Stop** : Arrête et affiche le temps final
- 🔄 **Reset** : Remet tout à zéro

### Configuration en temps réel
- Durée du décompte
- Seuils d'alerte (warning/danger)
- Mode écran d'attente
- Synchronisation instantanée avec l'overlay

### Overlay (Affichage OBS)
- Affichage en temps réel
- Synchronisé avec le dashboard
- Indicateur de connexion
- Animations fluides
- Bordure progressive

## 🔐 Sécurité

**Règles Firebase** (à configurer dans Database → Règles) :

```json
{
  "rules": {
    "game": {
      ".read": true,
      ".write": "auth != null && (auth.token.email === 'bryan.drouet24@gmail.com' || auth.token.email === 'clubradio.mauleon@gmail.com')"
    },
    "config": {
      ".read": true,
      ".write": "auth != null && (auth.token.email === 'bryan.drouet24@gmail.com' || auth.token.email === 'clubradio.mauleon@gmail.com')"
    }
  }
}
```

Cela permet :
- ✅ Tout le monde peut **lire** (overlay OBS)
- 🔒 Seuls bryan.drouet24@gmail.com et clubradio.mauleon@gmail.com peuvent **écrire** (dashboard)
- ❌ Tous les autres emails sont automatiquement bloqués

## 🆘 Dépannage

### L'overlay ne se connecte pas
→ Vérifiez `firebase-config.js`
→ Ouvrez la console (F12) pour voir les erreurs

### Le dashboarvous utilisez bryan.drouet24@gmail.com ou clubradio.mauleon@gmail.com
→ Vérifiez que Google Sign-In est activé dans Firebase Authenticationste dans Firebase Authentication
→ Vérifiez email et mot de passe

### Les changements ne s'affichent pas
→ Actualisez le navigateur (F5)
→ Dans OBS : clic droit sur la source → Actualiser

### Test rapide
→ Ouvrez `test-firebase.html` pour diagnostiquer

## 📱 Multi-écrans

Vous pouvez contrôler depuis :
- 💻 Votre PC principal
- 📱 Votre smartphone
- 📟 Une tablette
- 💻 Un autre ordinateur

Tous verront les changements en temps réel !

## 🎨 Personnalisation

Modifiez `config.js` pour changer :
- Couleurs des bordures
- Vitesse des animations
- Couleurs du fond
- Tailles de police

## 📚 Documentation complète

Pour plus de détails, consultez :
- `FIREBASE-SETUP.md` - Guide complet de configuration
- `test-firebase.html` - Outil de diagnostic

## ✅ Checklist de déploiement

- [ ] Firebase configuré
- [ ] `firebase-config.js` mis à jour
- [ ] Test local réussi (`test-firebase.html`)
- [ ] Règles de sécurité configurées
- [ ] Utilisateur créé dans Firebase Auth
- [ ] Code poussé sur GitHub
- [ ] GitHub Pages activé
- [ ] Overlay testé dans OBS
- [ ] Dashboard testé sur mobile

## 🎉 C'est prêt !

Vous pouvez maintenant contrôler votre timer 60 secondes depuis n'importe où !

---

**Questions ?** Contactez l'équipe technique de ClubRadio Mauléon.
