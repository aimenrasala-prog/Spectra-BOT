const { GoogleGenerativeAI } = require("@google/generative-ai");

async function gestionarIA(mensaje) {
    try {
        // Usamos la llave que tienes en Railway
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        
        // Probamos con 'gemini-1.5-flash', es el que mejor funciona para preguntas generales
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Enviamos la pregunta directamente para que actúe como ChatGPT
        const result = await model.generateContent(mensaje);
        const response = await result.response;
        const text = response.text();
        
        return text;

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error);

        // Si el error es por el modelo 1.5, intentamos con el 1.0 automáticamente
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(mensaje);
            const response = await result.response;
            return response.text();
        } catch (error2) {
            return "❌ Todavía hay un problema con tu API Key en Google Cloud. Asegúrate de que no tenga restricciones y que la 'Generative Language API' esté activa. ¡Google puede tardar un poco en habilitarla!";
        }
    }
}

module.exports = { gestionarIA };
