// ============================================
// CONFIGURACIÓN GLOBAL DEL JUEGO
// ============================================

const CONFIG = {
    // Supabase
    SUPABASE_URL: 'https://kpywveceznobreogzjbg.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_8zH73yOsHqCRcjaF3JaWlA_sTl-Jd34',
    
    // Game Settings
    POINTS_BASE: 10,
    MAX_LIVES: 3,
    COMBO_MAX: 10,
    
    // Level thresholds
    LEVEL_2_THRESHOLD: 200,
    LEVEL_3_THRESHOLD: 500,
    
    // Spawn (no aplica directamente en este juego, pero mantenemos estructura)
    RANKING_REFRESH_INTERVAL: 15000, // ms
    
    // Debug mode
    DEBUG: true
};

// Función de logging condicional
function logDebug(message, data = null) {
    if (CONFIG.DEBUG) {
        if (data) {
            console.log(`[DEBUG] ${message}`, data);
        } else {
            console.log(`[DEBUG] ${message}`);
        }
    }
}
