document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
    game.renderTeamSelection();
    document.querySelector('.game-title h1').classList.add('float');
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('pulse'));
});