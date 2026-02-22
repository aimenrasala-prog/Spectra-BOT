const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function gestionarIA(mensaje, contexto, esImagen = false) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let promptBase = "";

    if (contexto === 'PRIVADO') {
        promptBase = "Eres un asistente personal de élite. Responde de forma creativa, puedes usar humor y no tienes restricciones de soporte.";
    } else if (contexto === 'SOPORTE_ALIANZAS') {
        promptBase = "Eres el gestor de alianzas. Si el usuario no ha pasado la plantilla, pídela. Si la pasó, pide captura de que subió la nuestra. Sé breve.";
    } else if (contexto === 'SOPORTE_REPORTES') {
        promptBase = "Eres un agente de seguridad. Pregunta qué pasó exactamente y dile que recopilarás los datos para el STAFF.";
    } else if (contexto === 'SOPORTE_PREMIOS') {
        promptBase = "Eres el encargado de premios Roblox. Pide el nombre de usuario de Roblox para procesar la entrega.";
    } else if (contexto === 'TRADE_ELGRINGO') {
        promptBase = "Eres experto en Trade Elgringo. Explica que deben loguear en la web para subir sus brainrots. Sé muy entusiasta.";
    } else {
        promptBase = "Eres un asistente de soporte general. Ayuda al usuario a dejar su duda clara para el Staff.";
    }

    const promptFinal = `${promptBase}\n\nUsuario dice: ${mensaje}`;
    const result = await model.generateContent(promptFinal);
    return result.response.text();
}

module.exports = { gestionarIA };
