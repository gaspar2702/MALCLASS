// ============================================
// LÓGICA PRINCIPAL DEL JUEGO
// ============================================

let gameState = {
    currentMalwares: [],
    currentMalware: null,
    currentQuestion: null,
    answered: false,
    score: 0,
    lives: CONFIG.MAX_LIVES,
    correctAnswers: 0,
    level: 1,
    gameActive: true
};

// Callbacks para UI (se registran desde app.js)
let onGameUpdate = null;
let onGameEnd = null;

function registerGameCallbacks(updateCallback, endCallback) {
    onGameUpdate = updateCallback;
    onGameEnd = endCallback;
}

// Obtener nivel según puntaje
function calculateLevel(score) {
    if (score >= CONFIG.LEVEL_3_THRESHOLD) return 3;
    if (score >= CONFIG.LEVEL_2_THRESHOLD) return 2;
    return 1;
}

// Calcular puntos por respuesta
function calculatePoints(malwareLevel) {
    return CONFIG.POINTS_BASE * malwareLevel;
}

// Inicializar nueva partida
function initGame() {
    // Mezclar todos los malwares
    gameState.currentMalwares = shuffleArray([...MALWARE_DATABASE]);
    gameState.score = 0;
    gameState.lives = CONFIG.MAX_LIVES;
    gameState.correctAnswers = 0;
    gameState.answered = false;
    gameState.gameActive = true;
    gameState.level = 1;
    
    logDebug("Nueva partida iniciada con " + gameState.currentMalwares.length + " malwares");
    
    if (onGameUpdate) onGameUpdate(gameState);
    
    // Cargar primer malware
    loadNextMalware();
}

// Cargar siguiente malware
function loadNextMalware() {
    if (!gameState.gameActive) return;
    
    if (gameState.currentMalwares.length === 0) {
        gameWin();
        return;
    }
    
    gameState.currentMalware = gameState.currentMalwares.shift();
    gameState.currentQuestion = getQuestionsForMalware(gameState.currentMalware);
    gameState.answered = false;
    
    logDebug(`Nuevo malware: ${gameState.currentMalware.name}`);
    
    if (onGameUpdate) onGameUpdate(gameState);
}

// Procesar respuesta del jugador
function processAnswer(selectedIndex) {
    if (gameState.answered || !gameState.gameActive) return false;
    
    gameState.answered = true;
    const isCorrect = (selectedIndex === gameState.currentQuestion.correctIndex);
    let feedback = null;
    
    if (isCorrect) {
        const points = calculatePoints(gameState.currentMalware.level);
        gameState.score += points;
        gameState.correctAnswers++;
        gameState.level = calculateLevel(gameState.score);
        
        feedback = {
            isCorrect: true,
            message: `✅ +${points} puntos!`,
            explanation: gameState.currentQuestion.explanation
        };
        logDebug(`Respuesta correcta! +${points} pts`);
    } else {
        gameState.lives--;
        feedback = {
            isCorrect: false,
            message: `❌ -1 vida`,
            explanation: `Respuesta correcta: ${gameState.currentQuestion.options[gameState.currentQuestion.correctIndex]}`,
            extraInfo: gameState.currentMalware.desc
        };
        logDebug(`Respuesta incorrecta. Vidas restantes: ${gameState.lives}`);
    }
    
    if (onGameUpdate) onGameUpdate(gameState);
    
    // Verificar game over
    if (gameState.lives <= 0) {
        gameOver();
    }
    
    return { isCorrect, feedback };
}

// Continuar al siguiente malware
function nextMalware() {
    if (!gameState.answered) return false;
    if (gameState.lives <= 0) return false;
    
    loadNextMalware();
    return true;
}

// Game Over
function gameOver() {
    gameState.gameActive = false;
    logDebug(`GAME OVER - Puntaje final: ${gameState.score}`);
    
    const gameStats = {
        puntaje: gameState.score,
        nivel: gameState.level,
        correctas: gameState.correctAnswers,
        incorrectas: (gameState.correctAnswers + (CONFIG.MAX_LIVES - gameState.lives)) - gameState.correctAnswers
    };
    
    if (onGameEnd) onGameEnd(gameStats);
}

// Game Win (completar todos los malwares)
function gameWin() {
    gameState.gameActive = false;
    logDebug(`¡VICTORIA! Has derrotado a todos los malwares. Puntaje: ${gameState.score}`);
    
    const gameStats = {
        puntaje: gameState.score,
        nivel: gameState.level,
        correctas: gameState.correctAnswers,
        incorrectas: (gameState.correctAnswers + (CONFIG.MAX_LIVES - gameState.lives)) - gameState.correctAnswers
    };
    
    if (onGameEnd) onGameEnd(gameStats, true);
}

// Obtener estado actual del juego
function getGameState() {
    return { ...gameState };
}

// Reiniciar juego (misma partida)
function restartGame() {
    initGame();
}
