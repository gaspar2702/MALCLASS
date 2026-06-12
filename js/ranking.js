// ============================================
// MANEJO DE RANKING Y PUNTAJES
// ============================================

let rankingRefreshInterval = null;

async function loadAndDisplayRanking() {
    setLoadingRanking(true);
    const ranking = await getGlobalRanking(10);
    updateRankingUI(ranking);
    setLoadingRanking(false);
    return ranking;
}

function startRankingAutoRefresh() {
    if (rankingRefreshInterval) clearInterval(rankingRefreshInterval);
    rankingRefreshInterval = setInterval(loadAndDisplayRanking, CONFIG.RANKING_REFRESH_INTERVAL);
    logDebug(`Ranking auto-refresh iniciado (cada ${CONFIG.RANKING_REFRESH_INTERVAL/1000}s)`);
}

function stopRankingAutoRefresh() {
    if (rankingRefreshInterval) {
        clearInterval(rankingRefreshInterval);
        rankingRefreshInterval = null;
    }
}

async function updatePersonalBest(playerId) {
    const bestScore = await getPlayerBestScore(playerId);
    updatePlayerInfo(getCurrentPlayer()?.nombre || '', bestScore);
    return bestScore;
}
