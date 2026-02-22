const { GoogleGenerativeAI } = require("@google/generative-ai");

async function gestionarIA(mensaje) {
    try {
        // 1. Conexión con la llave de Railway
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        
        // 2. Intentamos usar el modelo más flexible
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 3. Le pedimos que sea como ChatGPT
        const promptSistema = "Eres un asistente inteligente como ChatGPT. Responde a cualquier pregunta de forma detallada.";
        const result = await model.generateContent(`${promptSistema}\n\nPregunta: ${mensaje}`);
        
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("ERROR REAL DE GOOGLE:", error.message);

        // --- EL PARACAÍDAS QUE FUNCIONA ---
        // Si el error es de permisos (el famoso 403), el bot te avisará con calma
        if (error.message.includes("403") || error.message.includes("permission")) {
            return "💡 **Casi listo:** Tu llave funciona, pero Google Cloud todavía está procesando el permiso. \n\n**Mientras esperas, puedes preguntarme cosas básicas como:**\n- ¿Qué es un trade?\n- ¿Cómo hago una alianza?";
        }

        // Si es otro error, te da una respuesta amable
        return "👋 ¡Hola! Estoy terminando de configurar mi cerebro de IA. Prueba a preguntarme algo sencillo en unos minutos.";
    }
}

module.exports = { gestionarIA };
