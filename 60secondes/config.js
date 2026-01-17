// Configuration du jeu 60 secondes
const CONFIG = {
    // Durée du décompte en secondes
    countdownDuration: 60,
    
    // Seuils d'alerte en secondes
    warningThreshold: 10,  // Passage en warning à X secondes
    dangerThreshold: 5,    // Passage en danger à X secondes
    
    // Couleurs de la bordure (dégradé)
    borderColor1: '#5a2d81',  // Violet foncé
    borderColor2: '#7b3f9e',  // Violet moyen-foncé
    
    // Couleurs pour les états d'alerte
    warningColor1: '#ff9500', // Orange
    warningColor2: '#ffcc00', // Jaune
    
    dangerColor1: '#ff0000',  // Rouge vif
    dangerColor2: '#ff3333',  // Rouge éclatant
    
    overtimeColor1: '#ff0000', // Rouge vif
    overtimeColor2: '#ff00ff', // Magenta
    
    // Couleurs du texte du compteur
    countdownTextColor: '#ffffff',      // Blanc par défaut
    countdownWarningTextColor: '#ff9500', // Orange pour warning
    countdownDangerTextColor: '#ff3b30',  // Rouge pour danger
    overtimeTextColor: '#ff0000',        // Rouge pour overtime
    
    // Couleurs du bouton
    buttonBgColor: 'rgba(0, 0, 0, 0.4)',
    buttonBorderColor: 'rgba(255, 255, 255, 0.3)',
    buttonTextColor: '#ffffff',
    buttonHoverBgColor: 'rgba(0, 0, 0, 0.6)',
    
    // Couleurs de fond (gradient animé) - Tons violets
    numberOfGradients: 5, // Nombre de lueurs à afficher
    gradientSpeed: 30,     // Vitesse de déplacement (en secondes, plus élevé = plus lent)
    gradientSize: 300,     // Taille des lueurs en pixels
    gradientOpacity: 0.12, // Opacité des lueurs (0.0 à 1.0)
    
    gradient1Color1: 'hsl(270, 80%, 50%)',
    gradient1Color2: 'hsl(290, 70%, 60%)',
    
    gradient2Color1: 'hsl(280, 75%, 55%)',
    gradient2Color2: 'hsl(260, 85%, 45%)',
    
    gradient3Color1: 'hsl(275, 70%, 50%)',
    gradient3Color2: 'hsl(285, 75%, 60%)',
    
    // Modes d'affichage
    waitingScreenMode: false,    // Mode écran d'attente
    showBackgroundImage: true,   // Afficher l'image de fond
    
    // Activer les logs de debug
    debugMode: false
};
