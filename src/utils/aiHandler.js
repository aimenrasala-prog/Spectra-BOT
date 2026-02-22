const { GoogleGenerativeAI } = require("@google/generative-ai");

async function gestionarIA(mensaje, contexto) {
    const texto = mensaje.toLowerCase();

    // --- 1. RESPUESTAS RÁPIDAS (Funcionan aunque la API falle) ---
    if (texto.includes("trade") || texto.includes("elgringo")) {
        return "📢 **TRADE ELGRINGO:** Para tradear con el Staff, abre ticket en #MIDLEMAN, elige la opción **Trade Elgringo** y sube tus brainrots a la web.";
    }
    if (texto.includes("alianza")) {
        return "🤝 **ALIANZAS:** Envía la plantilla de tu servidor y la captura de pantalla de nuestra publicidad para procesar la alianza.";
    }
    if (texto.includes("robux") || texto.includes("premio")) {
        return "🎁 **PREMIOS:** Pasa tu usuario de Roblox. Un Staff entregará tu premio en cuanto verifique los datos.";
    }

    // --- 2. INTENTO DE CONEXIÓN CON GEMINI ---
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        // Probamos el modelo flash que es el más probable que esté activo
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(mensaje);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error de API Gemini:", error.message);
        
        // --- 3. RESPUESTA DE EMERGENCIA (Si Google sigue dando error) ---
        return "👋 ¡Hola! Soy el asistente del servidor. Mi sistema de IA avanzada está en mantenimiento por Google, pero dime: ¿Necesitas ayuda con un **Trade**, una **Alianza** o un **Reporte**?";
    }
}

module.exports = { gestionarIA };
