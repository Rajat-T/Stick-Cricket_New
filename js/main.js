/**
 * Initializes the game once the DOM content is loaded. Creates the game
 * instance, renders the team selection screen, applies menu animations,
 * and registers global handlers such as pausing when the page becomes
 * hidden.
 */
let game; // Global game instance

document.addEventListener('DOMContentLoaded', () => {
    game = new Game('gameCanvas');
    game.renderTeamSelection();
    document.querySelector('.game-title h1').classList.add('float');
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('pulse'));

    // Use visibilitychange to pause gameplay when the page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameState === 'playing') {
            // Stop the game loop to freeze play until the tab is visible again
            game.gameLoopPaused = true;
        }
    });
});

