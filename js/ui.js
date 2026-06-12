// ============================================
// MANEJO DE INTERFAZ DE USUARIO
// ============================================

// Elementos DOM
let elements = {};

function initUI() {
    elements = {
        loginSection: document.getElementById('loginSection'),
        gameContent: document.getElementById('gameContent'),
        playerNameInput: document.getElementById('playerName'),
        startBtn: document.getElementById('startGameBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        displayName: document.getElementById('displayName'),
        personalBest: document.getElementById('personalBest'),
        scoreValue: document.getElementById('scoreValue'),
        healthFill: document.getElementById('healthFill'),
        correctCount: document.getElementById('correctCount'),
        levelText: document.getElementById('levelText'),
        challengeArea: document.getElementById('challengeArea'),
        nextBtn: document.getElementById('nextBtn'),
        gameOverlay: document.getElementById('gameOverlay'),
        finalScoreDisplay: document.getElementById('finalScoreDisplay'),
        messageDisplay: document.getElementById('messageDisplay'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        statusText: document.getElementById('statusText')
    };
}

function showLoginScreen() {
    elements.loginSection.style.display = 'block';
    elements.gameContent.style.display = 'none';
}

function showGameScreen() {
    elements.loginSection.style.display = 'none';
    elements.gameContent.style.display = 'block';
}

function updateGameUI(gameState) {
    // Actualizar stats
    elements.scoreValue.textContent = gameState.score;
    elements.correctCount.textContent = gameState.correctAnswers;
    
    const healthPercent = (gameState.lives / CONFIG.MAX_LIVES) * 100;
    elements.healthFill.style.width = `${healthPercent}%`;
    
    if (healthPercent < 30) {
        elements.healthFill.style.background = "linear-gradient(90deg, #EF4444, #F97316)";
    } else {
        elements.healthFill.style.background = "linear-gradient(90deg, #10B981, #06B6D4)";
    }
    
    // Actualizar nivel
    const levelNames = {1: "MALWARE BÁSICO", 2: "MALWARE PELIGROSO", 3: "AMENAZAS AVANZADAS"};
    elements.levelText.innerHTML = `🎯 NIVEL ${gameState.level}: ${levelNames[gameState.level]}`;
    
    // Si hay un malware actual, renderizarlo
    if (gameState.currentMalware && !gameState.answered) {
        renderChallenge(gameState);
    }
}

function renderChallenge(gameState) {
    const malware = gameState.currentMalware;
    const question = gameState.currentQuestion;
    
    elements.challengeArea.innerHTML = `
        <div class="malware-card">
            <div class="malware-icon">${malware.icon}</div>
            <div class="malware-name">${malware.name}</div>
            <div class="malware-desc">${malware.desc}</div>
        </div>
        <div class="question-text">❓ ${question.text}</div>
        <div class="options-grid" id="optionsGrid">
            ${question.options.map((opt, idx) => `
                <button class="option-btn" data-opt-index="${idx}">
                    <span class="option-prefix">${String.fromCharCode(65+idx)}</span> ${opt}
                </button>
            `).join('')}
        </div>
        <div id="feedbackArea" style="display:none;"></div>
    `;
}

function showFeedback(feedback) {
    const feedbackDiv = document.getElementById('feedbackArea');
    if (!feedbackDiv) return;
    
    feedbackDiv.style.display = 'block';
    if (feedback.isCorrect) {
        feedbackDiv.innerHTML = `<div style="padding:15px; border-left:4px solid #10B981; background:rgba(16,185,129,0.1); border-radius:16px;">
            ${feedback.message}<br>
            📚 ${feedback.explanation}
        </div>`;
    } else {
        feedbackDiv.innerHTML = `<div style="padding:15px; border-left:4px solid #EF4444; background:rgba(239,68,68,0.1); border-radius:16px;">
            ${feedback.message}<br>
            📚 ${feedback.explanation}<br>
            💡 ${feedback.extraInfo || ''}
        </div>`;
    }
    
    // Marcar opciones
    const opts = document.querySelectorAll('.option-btn');
    opts.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === gameState.currentQuestion.correctIndex) btn.classList.add('correct');
        if (idx === window._selectedAnswer && idx !== gameState.currentQuestion.correctIndex) btn.classList.add('incorrect');
    });
    
    elements.nextBtn.disabled = false;
}

function markSelectedOption(selectedIdx) {
    window._selectedAnswer = selectedIdx;
}

function enableNextButton(enabled) {
    elements.nextBtn.disabled = !enabled;
}

function showGameOver(finalScore, message, isVictory = false) {
    elements.finalScoreDisplay.textContent = finalScore;
    elements.messageDisplay.textContent = message;
    elements.gameOverlay.classList.add('show');
}

function hideGameOver() {
    elements.gameOverlay.classList.remove('show');
}

function updateRankingUI(rankingData) {
    const rankingDiv = document.getElementById('rankingList');
    if (!rankingData || rankingData.length === 0) {
        rankingDiv.innerHTML = '<div class="loading-text">Sin jugadores aún. ¡Sé el primero!</div>';
        return;
    }
    
    rankingDiv.innerHTML = rankingData.map((player, idx) => `
        <div class="ranking-item">
            <div class="ranking-name">
                ${idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📌'} 
                <strong>${player.nombre.substring(0, 20)}</strong>
            </div>
            <div class="ranking-score">${player.puntaje_total} pts</div>
        </div>
    `).join('');
}

function updateStatusMessage(message, isError = false) {
    if (elements.statusText) {
        elements.statusText.innerHTML = isError ? `❌ ${message}` : `✅ ${message}`;
        elements.statusText.style.color = isError ? '#EF4444' : '#10B981';
    }
}

function updatePlayerInfo(name, bestScore) {
    elements.displayName.textContent = name;
    elements.personalBest.textContent = bestScore;
}

function setLoadingRanking(loading) {
    if (loading) {
        document.getElementById('rankingList').innerHTML = '<div class="loading-text">Cargando ranking...</div>';
    }
}
