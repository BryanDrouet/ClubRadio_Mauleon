# Overlay basket

Le module propose une page de régie et une page transparente à utiliser comme source Navigateur dans OBS :

- `controle.html` : connexion Google, score, quart-temps, chrono, fautes, temps morts et visibilité.
- `overlay.html` : affichage transparent synchronisé.

Les données utilisent exclusivement les branches `basketball/match` et `basketball/display` du nouveau projet Firebase. Renseigner les valeurs du projet dans `firebase-config.js`, activer Google Sign-In et Realtime Database, puis déployer les règles correspondantes.

URL OBS après publication :

`https://bryandrouet.github.io/ClubRadio_Mauleon/basketball/overlay.html`
