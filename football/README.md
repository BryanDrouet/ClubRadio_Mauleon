# Overlay football

Le module propose deux pages synchronisées par Firebase Realtime Database :

- `controle.html` : page de régie, avec connexion Google autorisée, score, chrono, cartons et sponsor.
- `overlay.html` : page transparente à utiliser comme source Navigateur dans OBS.

## Utilisation dans OBS

Ajoutez l’URL publiée suivante comme source Navigateur, en `1920 x 1080` :

`https://bryandrouet.github.io/ClubRadio_Mauleon/football/overlay.html`

La régie est disponible à l’adresse `controle.html`. Les règles Firebase doivent être déployées après l’ajout de la branche `football` dans `60secondes/database.rules.json`.
