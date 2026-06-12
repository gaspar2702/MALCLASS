// ============================================
// CLIENTE DE SUPABASE Y OPERACIONES DB
// ============================================

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

let currentPlayer = null;

// Verificar conexión a Supabase
async function testSupabaseConnection() {
    logDebug("Probando conexión a Supabase...");
    try {
        const { data, error } = await supabaseClient
            .from('jugadores')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            logDebug("ERROR de conexión: " + error.message);
            return { success: false, error: error.message };
        }
        logDebug("✅ Conexión exitosa");
        return { success: true };
    } catch (e) {
        logDebug("Excepción: " + e.message);
        return { success: false, error: e.message };
    }
}

// Crear o obtener jugador
async function getOrCreatePlayer(nombre) {
    logDebug(`Buscando/creando jugador: ${nombre}`);
    
    // Buscar jugador existente
    const { data: existing, error: searchError } = await supabaseClient
        .from('jugadores')
        .select('*')
        .eq('nombre', nombre)
        .maybeSingle();
    
    if (searchError) {
        logDebug("Error búsqueda: " + searchError.message);
        return { success: false, error: searchError.message };
    }
    
    if (existing) {
        currentPlayer = existing;
        logDebug(`Jugador encontrado: ${existing.nombre} (ID: ${existing.id})`);
        return { success: true, player: existing, isNew: false };
    }
    
    // Crear nuevo jugador
    const { data: newPlayer, error: insertError } = await supabaseClient
        .from('jugadores')
        .insert({ 
            nombre: nombre, 
            puntaje_total: 0, 
            partidas_jugadas: 0, 
            aciertos_totales: 0 
        })
        .select()
        .single();
    
    if (insertError) {
        logDebug("Error creación: " + insertError.message);
        return { success: false, error: insertError.message };
    }
    
    currentPlayer = newPlayer;
    logDebug(`Nuevo jugador creado: ${newPlayer.nombre} (ID: ${newPlayer.id})`);
    return { success: true, player: newPlayer, isNew: true };
}

// Obtener mejor puntaje de un jugador
async function getPlayerBestScore(playerId) {
    const { data, error } = await supabaseClient
        .from('partidas')
        .select('puntaje')
        .eq('jugador_id', playerId)
        .order('puntaje', { ascending: false })
        .limit(1);
    
    if (error) {
        logDebug("Error obteniendo best score: " + error.message);
        return 0;
    }
    
    return (data && data[0]) ? data[0].puntaje : 0;
}

// Guardar partida completa
async function saveGameSession(playerId, gameStats) {
    const { puntaje, nivel, correctas, incorrectas } = gameStats;
    
    const { error: partidaError } = await supabaseClient
        .from('partidas')
        .insert({
            jugador_id: playerId,
            puntaje: puntaje,
            nivel_alcanzado: nivel,
            respuestas_correctas: correctas,
            respuestas_incorrectas: incorrectas
        });
    
    if (partidaError) {
        logDebug("Error guardando partida: " + partidaError.message);
        return false;
    }
    
    // Actualizar totales del jugador
    const { data: existing } = await supabaseClient
        .from('jugadores')
        .select('puntaje_total, partidas_jugadas, aciertos_totales')
        .eq('id', playerId)
        .single();
    
    const nuevoTotal = (existing?.puntaje_total || 0) + puntaje;
    const nuevasPartidas = (existing?.partidas_jugadas || 0) + 1;
    const nuevosAciertos = (existing?.aciertos_totales || 0) + correctas;
    
    await supabaseClient
        .from('jugadores')
        .update({
            puntaje_total: nuevoTotal,
            partidas_jugadas: nuevasPartidas,
            aciertos_totales: nuevosAciertos
        })
        .eq('id', playerId);
    
    logDebug(`Partida guardada: ${puntaje} puntos`);
    return true;
}

// Obtener ranking global
async function getGlobalRanking(limit = 10) {
    const { data, error } = await supabaseClient
        .from('jugadores')
        .select('nombre, puntaje_total')
        .order('puntaje_total', { ascending: false })
        .limit(limit);
    
    if (error) {
        logDebug("Error obteniendo ranking: " + error.message);
        return [];
    }
    
    return data || [];
}

// Obtener jugador actual
function getCurrentPlayer() {
    return currentPlayer;
}

// Cerrar sesión (limpiar estado local)
function logoutPlayer() {
    currentPlayer = null;
    logDebug("Sesión cerrada");
}
