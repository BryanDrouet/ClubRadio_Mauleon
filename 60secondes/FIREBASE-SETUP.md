# Configuration Firebase pour 60 Secondes

## 🔧 Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: "ClubRadio-60Secondes")
4. Suivez les étapes de création

### 2. Activer l'authentification

1. Dans votre projet Firebase, allez dans **Authentication**
2. Cliquez sur "Commencer"
3. Dans l'onglet **Sign-in method**, activez **"Google"**
   - Cliquez sur Google
   - Activez le fournisseur
   - Renseignez un email d'assistance pour le projet (ex: clubradio.mauleon@gmail.com)
   - Cliquez sur "Enregistrer"

⚠️ **IMPORTANT** : Seuls les emails suivants peuvent se connecter et contrôler le dashboard :
- `bryan.drouet24@gmail.com`
- `clubradio.mauleon@gmail.com`

Les règles de sécurité Firebase bloquent automatiquement tous les autres emails.

### 3. Activer Realtime Database

1. Dans votre projet Firebase, allez dans **Realtime Database**
2. Cliquez sur "Créer une base de données"
3. Choisissez un emplacement (Europe par exemple)
4. Commencez en **mode test** (vous configurerez les règles après)

### 4. Configurer les règles de sécurité

Une fois la database créée, allez dans l'onglet **Règles** et remplacez par :

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
- À tout le monde de lire les données (overlay OBS)
- **Seulement à bryan.drouet24@gmail.com et clubradio.mauleon@gmail.com d'écrire**
- Tous les autres emails sont automatiquement bloqués

### 5. Obtenir votre configuration Firebase

1. Dans les paramètres du projet (icône ⚙️), allez dans **Paramètres du projet**
2. Faites défiler jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Donnez un nom à votre app (ex: "60secondes-web")
5. Copiez la configuration qui apparaît

### 6. Mettre à jour firebase-config.js

Ouvrez le fichier `firebase-config.js` et remplacez les valeurs par votre configuration :

```javascript
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY_ICI",
    authDomain: "votre-projet.firebaseapp.com",
    databaseURL: "https://votre-projet-default-rtdb.firebaseio.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## 🚀 Déploiement sur GitHub Pages

### Option 1 : Via l'interface GitHub

1. Allez dans votre repository sur GitHub
2. Settings → Pages
3. Source : Deploy from a branch
4. Branch : `main` → `/` (root)
5. Sauvegardez

Vos pages seront disponibles à :
- **Overlay** : `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html`
- **Dashboard** : `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/dashboard.html`

### Option 2 : Via Git (déjà configuré si vous avez cloné)

Committez et poussez vos modifications :

```bash
git add .
git commit -m "Ajout de la version Firebase pour 60 secondes"
git push origin main
```

## 📺 Utilisation dans OBS Studio

1. Ouvrez OBS Studio
2. Ajoutez une nouvelle source → **Navigateur**
3. Configurez :
   - **URL** : `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/overlay.html`
   - **Largeur** : 1920
   - **Hauteur** : 1080
4. Cochez "Actualiser le navigateur quand la scène devient active"
5. Cliquez sur OK

## 🎮 Utilisation du Dashboard

1. Ouvrez `https://bryandrouet.github.io/ClubRadio_Mauleon/60secondes/dashboard.html`
2. Cliquez sur "Se connecter avec Google"
3. Choisissez votre compte Google :
   - bryan.drouet24@gmail.com
   - clubradio.mauleon@gmail.com

⚠️ **Seuls ces deux emails peuvent accéder au dashboard**. Tout autre email sera automatiquement refusé.

4. Contrôlez le timer :
   - **Démarrer** : Lance le décompte
   - **Pause** : Met en pause
   - **Reprendre** : Reprend après une pause
   - **Stop** : Arrête le timer
   - **Reset** : Remet à zéro

5. Configurez les paramètres :
   - Durée du décompte
   - Seuils d'alerte
   - Mode écran d'attente
   - Cliquez sur "Enregistrer la configuration"
Seuls bryan.drouet24@gmail.com et clubradio.mauleon@gmail.com peuvent contrôler le dashboard
- **Règles Firebase** : Les règles bloquent automatiquement tous les autres emails
- **Overlay public** : L'overlay est accessible publiquement (lecture seule)

- **Sécurité** : Ne partagez jamais votre mot de passe Firebase
- **Règles Firebase** : Les règles actuelles permettent à tout le monde de lire les données (nécessaire pour l'overlay), mais seuls les utilisateurs authentifiés peuvent écrire
- **GitHub Pages** : Les pages peuvent prendre quelques minutes pour se mettre à jour après un push

## 🔍 Dépannage

### L'overlay ne se connecte pas
- Vérifiez que `firebase-config.js` est bien configuré
- Vérifiez que les règles Firebase autorisent la lecture publique
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### Le dashboarvous utilisez un des deux emails autorisés :
  - bryan.drouet24@gmail.com
  - clubradio.mauleon@gmail.com
- Vérifiez que Google Sign-In est activé dans Firebase Authentication
- Si vous utilisez un autre email, vous verrez le message "Accès refusé" créé dans Firebase Authentication
- Vérifiez l'email et le mot de passe

### Les changements ne s'affichent pas dans OBS
- Actualisez la source navigateur dans OBS (clic droit → Actualiser)
- Vérifiez que l'URL est correcte
- Vérifiez la connexion réseau

## 📱 Accès mobile

Le dashboard est responsive et peut être utilisé depuis :
- Un smartphone
- Une tablette
- Un ordinateur portable

Parfait pour contrôler le timer à distance !

## 🎨 Personnalisation

Vous pouvez personnaliser l'apparence en modifiant :
- `config.js` : Durées, couleurs, seuils
- Les fichiers CSS dans `overlay.html` et `dashboard.html`

## 📊 Structure des données Firebase

```
/
├── game/
│   ├── command: "start" | "pause" | "resume" | "stop" | "reset"
│   └── timestamp: 1234567890
└── config/
    ├── countdownDuration: 60
    ├── warningThreshold: 10
    ├── dangerThreshold: 5
    ├── waitingScreenMode: false
    └── timestamp: 1234567890
```

## 🆘 Support

Pour toute question ou problème, contactez l'équipe technique de ClubRadio Mauléon.
