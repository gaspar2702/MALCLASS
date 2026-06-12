// ============================================
// INICIALIZACIÓN Y ORQUESTACIÓN DEL JUEGO
// ============================================

// Callback cuando el juego se actualiza
function onGameStateUpdate(gameState) {
    updateGameUI(gameState);
    
    // Si hay feedback pendiente, no habilitar next aún
    if (!gameState.answered) {
        enableNextButton(false);
    }
}

// Callback cuando el juego termina
async function onGameEnd(gameStats, isVictory = false) {
    const player = getCurrentPlayer();
    if (player) {
        await saveGameSession(player.id, gameStats);
        await updatePersonalBest(player.id);
        await loadAndDisplayRanking();
    }
    
    let message = "";
    if (isVictory) {
        message = "🎉 ¡MISIÓN COMPLETADA! Has identificado todos los malwares correctamente. ¡Eres un verdadero guardián de la ciberseguridad! 🎉";
    } else if (gameStats.puntaje >= 300) {
        message = "🏆 ¡ASOMBROSO! Eres un experto en malware. Tus conocimientos son dignos de un profesional. 🏆";
    } else if (gameStats.puntaje >= 150) {
        message = "🛡️ ¡Muy bien! Tienes buen conocimiento. Repasa los tipos de nivel 2 y 3 para llegar a experto.";
    } else if (gameStats.puntaje >= 50) {
        message = "📖 Buen intento. Te recomiendo repasar la presentación sobre malware y volver a intentarlo.";
    } else {
        message = "💪 No te rindas. Todos empezamos desde cero. Estudia los tipos de malware y vuélvelo a intentar. ¡Tú puedes!";
    }
    
    showGameOver(gameStats.puntaje, message, isVictory);
}

// Manejador de respuesta del jugador
function handleAnswer(selectedIndex) {
    const result = processAnswer(selectedIndex);
    if (result && result.feedback) {
        markSelectedOption(selectedIndex);
        showFeedback(result.feedback);
    }
}

// Eventos de UI
function bindEvents() {
    // Login
    elements.startBtn.addEventListener('click', async () => {
        const nombre = elements.playerNameInput.value.trim();
        if (!nombre) {
            alert("Ingresa un nombre para comenzar la misión");
            return;
        }
        if (nombre.length < 3) {
            alert("El nombre debe tener al menos 3 caracteres");
            return;
        }
        
        updateStatusMessage("Conectando...");
        const result = await getOrCreatePlayer(nombre);
        
        if (!result.success) {
            updateStatusMessage(result.error, true);
            alert("Error de conexión: " + result.error);
            return;
        }
        
        updateStatusMessage("Conectado!");
        const bestScore = await getPlayerBestScore(result.player.id);
        updatePlayerInfo(result.player.nombre, bestScore);
        
        showGameScreen();
        initGame();
        await loadAndDisplayRanking();
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', () => {
        logoutPlayer();
        showLoginScreen();
        stopRankingAutoRefresh();
        elements.playerNameInput.value = '';
    });
    
    // Next button
    elements.nextBtn.addEventListener('click', () => {
        nextMalware();
    });
    
    // Play again
    elements.playAgainBtn.addEventListener('click', () => {
        hideGameOver();
        initGame();
    });
    
    // Enter key en login
    elements.playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.startBtn.click();
        }
    });
    
    // Delegación de eventos para opciones (se regeneran dinámicamente)
    document.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('.option-btn');
        if (optionBtn && optionBtn.dataset.optIndex && !optionBtn.disabled) {
            const selectedIdx = parseInt(optionBtn.dataset.optIndex);
            handleAnswer(selectedIdx);
        }
    });
}

// Inicialización principal
async function initApp() {
    logDebug("Inicializando aplicación...");
    
    initUI();
    registerGameCallbacks(onGameStateUpdate, onGameEnd);
    bindEvents();
    
    // Verificar conexión a Supabase
    updateStatusMessage("Verificando conexión...");
    const connection = await testSupabaseConnection();
    
    if (connection.success) {
        updateStatusMessage("Conectado a Supabase");
        await loadAndDisplayRanking();
        startRankingAutoRefresh();
    } else {
        updateStatusMessage(`Error: ${connection.error}`, true);
    }
    
    showLoginScreen();
    logDebug("Aplicación lista!");
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
