const { GoogleGenerativeAI } = require("@google/generative-ai");

async function gestionarIA(mensaje, contexto) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        
        // Usamos gemini-1.5-flash que es el más potente y rápido actualmente
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Configuramos una personalidad que no lo limite a soporte
        const promptSistema = `Eres una inteligencia artificial avanzada, similar a ChatGPT. 
        Tu nombre es Gemini. Puedes responder preguntas sobre cualquier tema: historia, ciencia, 
        programación, consejos o charlas casuales. Responde de forma clara, natural y útil. 
        No te limites solo al servidor de Discord, eres un asistente global.`;

        const promptFinal = `${promptSistema}\n\nUsuario dice: ${mensaje}`;

        const result = await model.generateContent(promptFinal);
        const response = await result.response;
        const text = response.text();
        
        return text;

    } catch (error) {
        console.error("Error en Gemini:", error.message);

        // Si hay error de permisos (porque Google aún no activa la clave)
        if (error.message.includes("403") || error.message.includes("permission")) {
            return "❌ **Error de Google:** Tu cuenta de Google Cloud aún no ha terminado de activar los permisos para esta clave. Esto suele tardar entre 30 y 60 minutos desde que le das al botón 'Habilitar'. ¡Inténtalo en un rato!";
        }

        return "❌ Tuve un problema al procesar esa pregunta. ¿Podrías repetirla?";
    }
}

module.exports = { gestionarIA };
