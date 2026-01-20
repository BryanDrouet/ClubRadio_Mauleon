# Architecture de la Version Firebase - 60 Secondes

## 📊 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Cloud                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Realtime Database                           │   │
│  │  ┌──────────────┐      ┌──────────────┐            │   │
│  │  │   /game      │      │   /config    │            │   │
│  │  │  - command   │      │  - duration  │            │   │
│  │  │  - timestamp │      │  - thresholds│            │   │
│  │  └──────────────┘      └──────────────┘            │   │
│  │                                                      │   │
│  │         Authentication                              │   │
│  │  ┌─────────────────────────────┐                   │   │
│  │  │  clubradio.mauleon@gmail... │                   │   │
│  │  └─────────────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket (temps réel)
          ┌────────────────┴────────────────┐
          │                                 │
   ┌──────▼───────┐              ┌─────────▼────────┐
   │   Overlay    │              │    Dashboard     │
   │  (OBS/Web)   │              │   (Contrôle)     │
   │              │              │                  │
   │  - Lecture   │◄─────────────┤  - Écriture     │
   │  - Affichage │  Sync temps  │  - Config       │
   │              │    réel      │  - Auth requis  │
   └──────────────┘              └──────────────────┘
```

## 🏗️ Composants

### 1. Firebase Realtime Database

#### Structure des données

```json
{
  "game": {
    "command": "start|pause|resume|stop|reset",
    "timestamp": 1234567890
  },
  "config": {
    "countdownDuration": 60,
    "warningThreshold": 10,
    "dangerThreshold": 5,
    "waitingScreenMode": false,
    "timestamp": 1234567890
  }
}
```

#### Flux de données

1. **Dashboard → Firebase**
   - L'utilisateur clique sur "Démarrer"
   - `gameRef.set({ command: 'start', timestamp: Date.now() })`
   - Écriture dans `/game`

2. **Firebase → Overlay**
   - WebSocket détecte le changement
   - `gameRef.on('value', callback)`
   - L'overlay reçoit la commande en temps réel
   - Le timer démarre

### 2. Firebase Authentication

- **Méthode** : Email/Password
- **Utilisateur** : clubradio.mauleon@gmail.com
- **Accès** :
  - Dashboard : Authentification requise
  - Overlay : Lecture publique (pas d'auth)

### 3. Règles de sécurité

```json
{
  "rules": {
    "game": {
      ".read": true,           // Tout le monde peut lire
      ".write": "auth != null" // Seuls les utilisateurs authentifiés peuvent écrire
    },
    "config": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 🔄 Flux de données

### Scénario 1 : Démarrer le timer

```
[Dashboard] Utilisateur clique "Démarrer"
     ↓
[Dashboard] gameRef.set({ command: 'start', ... })
     ↓
[Firebase] Stocke la commande
     ↓
[Firebase] Notifie tous les listeners (WebSocket)
     ↓
[Overlay] Reçoit { command: 'start' }
     ↓
[Overlay] startGame() → Lance le timer
```

### Scénario 2 : Modifier la configuration

```
[Dashboard] Utilisateur modifie "Durée: 90s"
     ↓
[Dashboard] Clique "Enregistrer"
     ↓
[Dashboard] configRef.set({ countdownDuration: 90, ... })
     ↓
[Firebase] Stocke la nouvelle config
     ↓
[Firebase] Notifie tous les listeners
     ↓
[Overlay] Reçoit la nouvelle config
     ↓
[Overlay] currentConfig = { countdownDuration: 90, ... }
     ↓
[Overlay] Met à jour l'affichage si arrêté
```

## 📡 Synchronisation en temps réel

### Technologies utilisées

- **WebSocket** : Connexion persistante bidirectionnelle
- **Firebase SDK** : Gère automatiquement les reconnexions
- **Real-time listeners** : `.on('value', callback)`

### Latence

- Locale (même réseau) : **< 50ms**
- Distante (4G/5G) : **100-300ms**
- Hors ligne : Mise en file d'attente, sync à la reconnexion

### Gestion de la déconnexion

```javascript
// Indicateur de connexion
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
        // Connecté ✓
    } else {
        // Déconnecté ✗
    }
});
```

## 🔐 Sécurité

### Niveaux de sécurité

1. **Authentication Firebase**
   - Seuls les utilisateurs enregistrés peuvent se connecter au dashboard
   - Mot de passe chiffré côté Firebase

2. **Règles de base de données**
   - Lecture publique (overlay OBS doit fonctionner sans auth)
   - Écriture restreinte aux utilisateurs authentifiés

3. **HTTPS obligatoire**
   - GitHub Pages force HTTPS
   - Firebase utilise toujours HTTPS

### Limitations

⚠️ **Attention** : Les données sont lisibles publiquement
- ✅ OK pour : commandes de timer, configuration du jeu
- ❌ Pas OK pour : informations sensibles, données personnelles

## 🚀 Performance

### Optimisations

1. **Listeners ciblés**
   - On écoute seulement `/game` et `/config`
   - Pas de .once() répétitifs, on utilise .on()

2. **Mise à jour efficace**
   - `set()` écrase complètement (plus rapide)
   - `update()` pour modifications partielles (non utilisé ici)

3. **Déconnexion automatique**
   - Firebase SDK gère les reconnexions
   - Pas de polling manuel

### Limites Firebase (Plan gratuit)

- **100 connexions simultanées** : Largement suffisant
- **10 GB de données téléchargées/mois** : OK pour ce cas d'usage
- **1 GB stocké** : Nos données sont minuscules

## 🔧 Maintenance

### Surveillance

1. **Console Firebase**
   - Allez sur console.firebase.google.com
   - Vérifiez l'usage dans "Usage"
   - Consultez les logs dans "Functions" (si activées)

2. **Test de connexion**
   - Ouvrez `test-firebase.html`
   - Vérifiez l'état vert ✓

### Mise à jour

Pour modifier la structure de données :

1. Mettez à jour les règles de sécurité
2. Modifiez le code (dashboard + overlay)
3. Testez en local
4. Déployez sur GitHub Pages

## 🌐 Déploiement

### GitHub Pages

```
Repository GitHub
     ↓
GitHub Actions (automatique)
     ↓
GitHub Pages CDN
     ↓
https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/
```

**Avantages** :
- ✅ Gratuit
- ✅ HTTPS automatique
- ✅ CDN mondial
- ✅ Mise à jour automatique au push

## 📊 Monitoring

### Métriques clés

- **Temps de latence** : < 300ms acceptable
- **Taux de réussite** : > 99%
- **Disponibilité** : 99.9% (Firebase SLA)

### Alertes

Firebase envoie des emails automatiques si :
- Quota dépassé
- Trop d'erreurs d'authentification
- Problème de facturation

## 🔮 Évolutions possibles

### Version 2.0

1. **Historique des sessions**
   ```json
   {
     "sessions": {
       "2024-01-20_14h30": {
         "duration": 62,
         "date": "2024-01-20T14:30:00Z"
       }
     }
   }
   ```

2. **Multi-timer**
   - Plusieurs timers simultanés
   - Un overlay par timer

3. **Permissions avancées**
   - Admin : contrôle total
   - Opérateur : start/stop uniquement
   - Viewer : lecture seule

4. **Analytics**
   - Temps moyen d'utilisation
   - Nombre de sessions par jour
   - Durées les plus fréquentes

## 📝 Conclusion

Cette architecture permet :
- ✅ Contrôle à distance
- ✅ Synchronisation temps réel
- ✅ Multi-appareils
- ✅ Fiabilité élevée
- ✅ Coût zéro (plan gratuit)
- ✅ Maintenance minimale

Parfait pour une utilisation en production par ClubRadio Mauléon !
