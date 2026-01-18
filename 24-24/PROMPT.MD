je veux un overlay de stream 24/24 7/7 pour obs studio en html css js json pour le clubradio qui ne soit pas gourmand en ressoucre et qui passe en boucle nos vidéos dans l'ordre défini dans le json si posssible dynamiquement entre coupé de pauses musicales de sons que je fournirais dans un autre json je veux à des heures très précises certaines vidéo comme les vidéos quotidiennes de la chaine meteo https://www.youtube.com/@MeteoExpressYT j'irais sur vsc avec claude sonnet 4.5 donne moi un prompt efficace pour qu'il me fasse tout proprement comme je le souhaite, j'aimerais dans le futur que cet overlay soit accessible en ligne sur https://bryandrouet.github.io/ClubRadio_Mauleon/24-24/index.html et donc dispo aussi en test sur http://127.0.0.1:5500/24-24/index.html obs tournera en boucle sur le pc du clubradio mais le dev sera fait et testé sur mon pc perso je veux qu'un max de choses soient faites dynamiquement la page html doit respecter le format 1920x1080 soit un format 16:9 ton prompt doit prendre tous les cas de possibilité en compte je ne veux pas avoir a faire je ne sais combien de prompts pour tout améliorer un fichier config.js doit pouvoir faire tout régler (par exemple la durée entre les pauses musicales) étant donné que les pauses musicales arrivent toutes x minutes (défini dans config) pense a mettre un bandeau pour avertir les gens du stream de la prochaine pause et de la prochaine vidéo à passer si le temps entre 2 musiques est supérieur a 30% sinon affiche le temps pour la prochaine vidéo je veux des json et un config simple a comprendre et modif pour des personnes qui n'y connaissent rien (je ne serais pas seul à l'utilsier)





















C'est un projet ambitieux et très utile pour le Club Radio ! Comme tu as fourni les détails des machines dès le départ, je n'ai pas besoin de te demander sur quel PC tu travailles : je note que le **développement** se fera sur ton **HP ProBook** (Intel Pentium Gold, 32Go RAM) et la **production** sur le **Lenovo du ClubRadio** (Ryzen 7, 16Go RAM).

La configuration du PC du club est largement suffisante pour faire tourner OBS et cet overlay HTML/JS, à condition que le code soit propre (pas de fuites de mémoire).

Voici le prompt optimisé pour **Claude 3.5 Sonnet** (ou 4.5 si disponible). Il est structuré pour générer une architecture modulaire, robuste et facile à maintenir pour des débutants.

---

### Le Prompt pour Claude

Copie-colle le texte ci-dessous dans ton chat avec Claude :

```markdown
Agis comme un Senior Front-End Developer expert en création d'overlays pour OBS Studio. Je dois créer un système d'affichage dynamique pour une webradio associative (ClubRadio) qui tournera 24h/24 et 7j/7.

**Contexte et Contraintes Techniques :**
1.  **Cible :** Le rendu sera intégré comme "Source Navigateur" dans OBS (résolution 1920x1080).
2.  **Performance :** Le code doit être extrêmement léger (Vanilla JS uniquement, pas de framework lourd type React/Vue). Il doit tourner indéfiniment sans fuite de mémoire sur un PC portable milieu de gamme.
3.  **Déploiement :** Le projet sera hébergé sur GitHub Pages, mais le développement se fait en local (Live Server). Les chemins doivent être relatifs.
4.  **Utilisateurs :** La configuration doit être modifiable par des personnes sans connaissances techniques via des fichiers JSON simples et un fichier `config.js` très commenté.

**Architecture de Fichiers Demandée :**
* `index.html` : Structure sémantique simple.
* `style.css` : Design moderne, responsive (fixé 16:9), animations fluides pour le bandeau.
* `app.js` : Toute la logique métier.
* `config.js` : Variables globales (chemins, délais, seuils).
* `playlist.json` : Liste des vidéos standards.
* `music.json` : Liste des fichiers audio pour les pauses.
* `schedule.json` : Événements à heure fixe (ex: Météo).

**Fonctionnalités Clés à Implémenter :**

1.  **Lecteur Vidéo Principal :**
    * Lecture en boucle des vidéos définies dans `playlist.json`.
    * Support des fichiers locaux (.mp4) et si possible intégration YouTube IFrame API (pour la météo) mais avec une gestion robuste des erreurs (fallback si pas d'internet).

2.  **Gestionnaire de Pauses Musicales (Intercalaires) :**
    * Toutes les X minutes (défini dans `config.js`), le système doit insérer une pause musicale *après* la fin de la vidéo en cours (ne pas couper une vidéo brutalement).
    * Les musiques sont tirées aléatoirement ou séquentiellement depuis `music.json`.

3.  **Planificateur Horaire (Fixed Schedule) :**
    * À des heures précises (ex: 08:00, 12:00 définies dans `schedule.json`), le système doit forcer le passage d'une vidéo spécifique (ex: Météo Express).
    * Si une vidéo est en cours à l'heure H, on la laisse finir ou on fait un fondu (paramétrable) avant de lancer l'événement prioritaire.

4.  **Interface et Bandeau d'Information (Ticker) :**
    * Un bandeau en bas d'écran affiche les infos.
    * **Logique conditionnelle stricte :**
        * Calculer le temps restant avant la prochaine pause musicale.
        * Si ce temps est supérieur à 30% de l'intervalle total configuré : Afficher "Prochaine pause musicale dans X minutes".
        * Sinon (si on est proche de la pause) : Afficher le titre de la *prochaine* vidéo ou de l'événement à venir.
    * Afficher l'heure actuelle en permanence dans un coin.

**Structure des Données (Exemples à respecter) :**

* `config.js` :
    ```javascript
    const CONFIG = {
        musicIntervalMinutes: 20, // Temps entre deux pauses musicales
        musicThresholdPercent: 0.3, // Seuil des 30% pour l'affichage
        pathPrefix: "./assets/" // Préfixe pour les fichiers
    };
    ```

* `playlist.json` et `music.json` : Liste d'objets simples `{ "title": "Nom", "src": "fichier.mp4", "duration": "03:45" }`.

**Livrables attendus :**
Fournis-moi le code complet pour chaque fichier. Le code JS doit être abondamment commenté en français pour expliquer la logique (surtout la gestion du temps et des priorités). Ajoute une gestion d'erreur : si une vidéo ne charge pas, passer immédiatement à la suivante.

```

---

### Pourquoi ce prompt est efficace ?

1. **Contrainte "Vanilla JS"** : C'est crucial pour ton PC Lenovo (ClubRadio). Les frameworks modernes consomment plus de RAM. Ici, on reste au plus près du navigateur.
2. **La règle des 30%** : J'ai explicitement codifié ta demande logique ("Logique conditionnelle stricte") pour qu'il écrive l'algorithme exact dans le JS.
3. **Accessibilité "No-Code"** : En insistant sur `config.js` et la structure JSON, Claude va séparer le code complexe des réglages simples, permettant à tes camarades de changer l'intervalle musical juste en changeant un chiffre.
4. **Gestion de la Météo** : J'ai demandé une gestion "Prioritaire" (`schedule.json`). C'est le point le plus délicat. Pour la chaîne YouTube *Météo Express*, sache que récupérer *automatiquement* la dernière vidéo du jour sans clé API Google (qui est complexe à obtenir) est difficile en pur HTML/JS. Claude te proposera probablement de mettre le lien manuellement chaque jour ou d'utiliser une iframe.

### Conseil pour l'intégration YouTube

Si tu veux vraiment la vidéo Météo Express sans intervention manuelle quotidienne, l'idéal serait de télécharger la vidéo tous les matins et de la mettre dans un dossier local, car les "embeds" YouTube dans OBS peuvent parfois avoir des publicités ou des soucis de lecture automatique (autoplay policy).

**Veux-tu que je prépare aussi la structure des dossiers (fichiers vides) pour que tu n'aies plus qu'à copier-coller le code de Claude ?**