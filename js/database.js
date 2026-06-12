// ============================================
// BASE DE DATOS DE MALWARE
// Basada en el PDF de Certiprof CSFPC™
// ============================================

const MALWARE_DATABASE = [
    { 
        id: 1, 
        name: "VIRUS", 
        icon: "🦠", 
        desc: "Se adjunta a archivos limpios y se propaga al ejecutarlos.", 
        characteristics: ["Se pega a otros archivos", "Necesita intervención humana"], 
        level: 1,
        facts: ["Ejemplo: ILOVEYOU (2000)", "Como una gripe para computadoras"]
    },
    { 
        id: 2, 
        name: "TROYANO", 
        icon: "🐴", 
        desc: "Se disfraza de software legítimo para engañarte.", 
        characteristics: ["Se disfraza de algo bueno", "Crea puertas traseras"], 
        level: 1,
        facts: ["Nombre del Caballo de Troya", "No se replica solo"]
    },
    { 
        id: 3, 
        name: "RANSOMWARE", 
        icon: "💰", 
        desc: "Secuestra tus archivos y pide rescate económico.", 
        characteristics: ["Encripta archivos", "Pide rescate en criptomonedas"], 
        level: 2,
        facts: ["WannaCry (2017) afectó 200,000 equipos", "Nunca pagar el rescate"]
    },
    { 
        id: 4, 
        name: "SPYWARE", 
        icon: "👁️", 
        desc: "Espía tus actividades sin que lo notes.", 
        characteristics: ["Espía en secreto", "Roba contraseñas"], 
        level: 1,
        facts: ["Puede grabar teclas", "Vende información a terceros"]
    },
    { 
        id: 5, 
        name: "GUSANO", 
        icon: "🐛", 
        desc: "Se replica automáticamente por la red sin intervención.", 
        characteristics: ["Se propaga solo", "No necesita archivo anfitrión"], 
        level: 2,
        facts: ["Ejemplo: Morris Worm (1988)", "Consume ancho de banda"]
    },
    { 
        id: 6, 
        name: "KEYLOGGER", 
        icon: "⌨️", 
        desc: "Registra cada tecla que presionas.", 
        characteristics: ["Graba tecleo", "Roba credenciales"], 
        level: 2,
        facts: ["Puede ser hardware o software", "Roba contraseñas"]
    },
    { 
        id: 7, 
        name: "ROOTKIT", 
        icon: "🎭", 
        desc: "Se oculta en niveles profundos del sistema operativo.", 
        characteristics: ["Se esconde del antivirus", "Opera a nivel kernel"], 
        level: 3,
        facts: ["Difícil de detectar", "Puede persistir incluso después de formatear"]
    },
    { 
        id: 8, 
        name: "ADWARE", 
        icon: "📢", 
        desc: "Muestra publicidad no deseada y molesta.", 
        characteristics: ["Muestra anuncios", "Viene con software gratis"], 
        level: 1,
        facts: ["A menudo es un PUP", "Molesto pero no siempre peligroso"]
    },
    { 
        id: 9, 
        name: "BOTNET", 
        icon: "🤖", 
        desc: "Red de dispositivos infectados controlados remotamente.", 
        characteristics: ["Dispositivos esclavos", "Usado para ataques DDoS"], 
        level: 3,
        facts: ["El dueño se llama Botmaster", "Puede tener millones de dispositivos"]
    },
    { 
        id: 10, 
        name: "RAT", 
        icon: "🎮", 
        desc: "Permite control remoto total del dispositivo infectado.", 
        characteristics: ["Control total remoto", "Acceso a cámara y micrófono"], 
        level: 3,
        facts: ["Remote Access Trojan", "Uno de los más peligrosos"]
    }
];

// Banco de preguntas dinámicas (generadas por malware)
const QUESTION_TEMPLATES = {
    CHARACTERISTIC: (malware) => ({
        text: `¿Cuál es la principal característica del ${malware.name}?`,
        correctIndex: 0
    }),
    PROPAGATION: (malware) => ({
        text: `¿Cómo se propaga típicamente el ${malware.name}?`,
        correctIndex: malware.id === 5 ? 3 : 0
    }),
    SIGNAL: (malware) => ({
        text: `Si tu computadora tiene ${malware.name}, ¿qué señal podrías notar?`,
        correctIndex: 0
    })
};

function getQuestionsForMalware(malware) {
    const questions = [
        {
            text: `¿Cuál es la principal característica del ${malware.name}?`,
            options: [malware.characteristics[0], malware.characteristics[1], "Es fácil de eliminar", "Solo afecta a Mac"],
            correctIndex: 0,
            explanation: malware.desc
        },
        {
            text: `¿Cómo se propaga típicamente el ${malware.name}?`,
            options: ["Por correo electrónico (phishing)", "Infectando archivos ejecutables", "A través de redes sociales", malware.id === 5 ? "Se replica solo por la red automáticamente" : "Requiere que el usuario lo ejecute"],
            correctIndex: malware.id === 5 ? 3 : 0,
            explanation: malware.desc
        },
        {
            text: `Si tu computadora tiene ${malware.name}, ¿qué señal podrías notar?`,
            options: [
                malware.id === 3 ? "Tus archivos no se abren y piden rescate" : 
                (malware.id === 4 ? "Tu computadora está más lenta y hay programas raros" : 
                (malware.id === 1 ? "Archivos .exe duplicados" : "Aparecen ventanas emergentes")),
                "La pantalla se ve más brillante",
                "El internet es más rápido",
                "Se instalan actualizaciones automáticas"
            ],
            correctIndex: 0,
            explanation: malware.desc
        }
    ];
    return questions[malware.id % questions.length];
}

// Función para mezclar array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
