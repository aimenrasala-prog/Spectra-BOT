const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializamos la API fuera de la función para mayor rapidez
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function gestionarIA(mensaje, contexto) {
    try {
        // Forzamos el uso del modelo 'gemini-1.5-flash' correctamente
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        let promptBase = "";

        if (contexto === 'PRIVADO') {
            promptBase = "Eres un asistente personal de élite. Responde de forma creativa, con un toque de humor y sin restricciones de soporte.";
        } else if (contexto === 'TRADE_ELGRINGO') {
            promptBase = "Eres el experto en Trade Elgringo. Tu misión es explicar que deben entrar a la web para subir sus brainrots y tradear. Sé muy animado.";
        } else if (contexto === 'SOPORTE_ALIANZAS') {
            promptBase = "Eres el gestor de alianzas. Debes pedir la plantilla del servidor y una captura de pantalla que demuestre que han subido nuestra publicidad.";
        } else if (contexto === 'SOPORTE_REPORTES') {
            promptBase = "Eres el encargado de seguridad. Pregunta amablemente qué ha sucedido y pide pruebas (fotos/videos) para que el Staff lo revise.";
        } else if (contexto === 'SOPORTE_PREMIOS') {
            promptBase = "Eres el encargado de entregar premios de Roblox. Pide el nombre de usuario de Roblox y di que un Staff entregará el premio pronto.";
        } else {
            promptBase = "Eres un asistente de soporte general. Ayuda al usuario con su duda de forma clara.";
        }

        const promptFinal = `${promptBase}\n\nUsuario dice: ${mensaje}`;

        // Generar contenido
        const result = await model.generateContent(promptFinal);
        const response = await result.response;
        const text = response.text();
        
        return text;

    } catch (error) {
        console.error("ERROR DETALLADO DE GEMINI:", error);
        
        // Mensaje amigable según el error de los logs
        if (error.message.includes("404")) {
            return "❌ Error: El modelo de IA no responde. Verifica que la API Key sea correcta y esté habilitada.";
        }
        return "❌ Tuve un pequeño corto circuito mental. ¿Puedes repetir eso?";
    }
}

module.exports = { gestionarIA };
