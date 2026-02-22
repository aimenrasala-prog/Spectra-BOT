const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializamos la API con la llave que tienes en Railway
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function gestionarIA(mensaje, contexto) {
    try {
        // Usamos 'gemini-pro', que tiene mayor compatibilidad con las API Keys de Cloud Console
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        let promptBase = "";

        // Configuración de los prompts según el canal/categoría
        if (contexto === 'PRIVADO') {
            promptBase = "Eres un asistente personal de élite. Responde de forma creativa y sin restricciones de soporte.";
        } else if (contexto === 'TRADE_ELGRINGO') {
            promptBase = "Eres experto en Trade Elgringo. Tu misión es decirles que entren a la web para subir sus 'brainrots' y tradear. Sé muy entusiasta.";
        } else if (contexto === 'SOPORTE_ALIANZAS') {
            promptBase = "Eres el gestor de alianzas. Pide la plantilla del servidor y la captura de que subieron nuestra publicidad.";
        } else if (contexto === 'SOPORTE_REPORTES') {
            promptBase = "Eres encargado de seguridad. Pregunta qué pasó y pide pruebas visuales para el Staff.";
        } else if (contexto === 'SOPORTE_PREMIOS') {
            promptBase = "Eres encargado de premios Roblox. Pide el nombre de usuario de Roblox.";
        } else {
            promptBase = "Eres un asistente de soporte. Ayuda al usuario con su duda de forma clara.";
        }

        const promptFinal = `${promptBase}\n\nPregunta del usuario: ${mensaje}`;

        // Llamada a la API
        const result = await model.generateContent(promptFinal);
        const response = await result.response;
        const text = response.text();
        
        return text;

    } catch (error) {
        // Log detallado en la consola de Railway para saber si es la Key o el Modelo
        console.error("--- ERROR EN AI_HANDLER ---");
        console.error(error.message);

        if (error.message.includes("404")) {
            return "❌ Error: El modelo 'gemini-pro' no se encuentra o no está habilitado en tu API Key.";
        }
        if (error.message.includes("403")) {
            return "❌ Error: Acceso denegado. Revisa que la 'Generative Language API' esté HABILITADA en Google Cloud.";
        }
        if (error.message.includes("API key not valid")) {
            return "❌ Error: La API Key que pusiste en Railway no es válida.";
        }

        return "❌ Hubo un problema al conectar con mi cerebro de IA. Prueba de nuevo en unos segundos.";
    }
}

module.exports = { gestionarIA };
