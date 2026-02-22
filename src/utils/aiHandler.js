const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function gestionarIA(mensaje, contexto) {
    // Lista de modelos a intentar (del más nuevo al más compatible)
    const modelosAIntentar = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];
    let ultimoError = "";

    for (const nombreModelo of modelosAIntentar) {
        try {
            const model = genAI.getGenerativeModel({ model: nombreModelo });
            
            let promptBase = "Eres un asistente de soporte para un servidor de Discord.";
            if (contexto === 'PRIVADO') promptBase = "Eres un asistente personal creativo.";
            if (contexto === 'TRADE_ELGRINGO') promptBase = "Eres experto en Trade Elgringo. Diles que usen la web.";

            const promptFinal = `${promptBase}\n\nUsuario: ${mensaje}`;
            const result = await model.generateContent(promptFinal);
            const response = await result.response;
            return response.text();

        } catch (error) {
            ultimoError = error.message;
            console.log(`Log: El modelo ${nombreModelo} falló, intentando el siguiente...`);
            continue; // Si falla, salta al siguiente modelo de la lista
        }
    }

    // Si llega aquí es porque fallaron todos los modelos
    console.error("ERROR FINAL:", ultimoError);
    if (ultimoError.includes("API key not valid")) return "❌ Tu GEMINI_KEY es incorrecta. Revísala en Railway.";
    return "❌ Error de permisos: Asegúrate de que la API esté HABILITADA en Google Cloud Console.";
}

module.exports = { gestionarIA };
