const axios = require('axios');

async function gestionarIA(mensaje) {
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile", // Un modelo potente como ChatGPT
                messages: [
                    { role: "system", content: "Eres una IA avanzada como ChatGPT. Responde a todo lo que el usuario te pregunte de forma clara y útil." },
                    { role: "user", content: mensaje }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_KEY}`, // Asegúrate de que en Railway se llame igual
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error("Error en la IA:", error.response ? error.response.data : error.message);
        return "❌ Hubo un error al conectar con mi cerebro. Asegúrate de que la clave de Groq esté bien puesta en Railway.";
    }
}

module.exports = { gestionarIA };
