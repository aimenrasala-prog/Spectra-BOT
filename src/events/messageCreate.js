const { gestionarIA } = require('../utils/aiHandler');

let contadorMensajes = 0;
const INSULTOS = ['pendejo', 'estupido', 'idiota']; // Añade aquí las palabras que quieras prohibir

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        // --- 1. MODERACIÓN ---
        const texto = message.content.toLowerCase();
        const palabras = message.content.split(' ').filter(p => p.length > 1);
        const mayusculas = palabras.filter(p => p === p.toUpperCase());

        if (mayusculas.length > 2 || INSULTOS.some(insulto => texto.includes(insulto))) {
            await message.delete().catch(() => {});
            return message.channel.send(`⚠️ ${message.author}, modera tu lenguaje o el uso de mayúsculas.`)
                .then(m => setTimeout(() => m.delete(), 5000));
        }

        // --- 2. RECORDATORIO DE TRADE (Cada 7 mensajes) ---
        if (message.channel.id === process.env.ID_CANAL_GENERAL) {
            contadorMensajes++;
            if (contadorMensajes >= 7) {
                contadorMensajes = 0;
                await message.channel.send("📢 **SI QUIERES TRADEAR CON EL STAFF ABRE TICKET EN #MIDLEMAN Y ELIGE LA OPCIÓN DE TRADE ELGRINGO**");
            }
        }

        // --- 3. RESPUESTA DE LA IA ---
        // Detectar si es el canal privado contigo
        const esPrivado = message.author.id === process.env.ID_TU_USUARIO_ID && message.channel.id === process.env.ID_CANAL_IA_PRIVADO;
        
        // Detectar si está en una categoría de tickets
        const esTicketSoporte = message.channel.parentId === process.env.ID_CAT_SOPORTE;
        const esTicketTrade = message.channel.parentId === process.env.ID_CAT_TRADE;

        if (esPrivado || esTicketSoporte || esTicketTrade) {
            await message.channel.sendTyping();

            let contextoIA = 'GENERAL';
            if (esPrivado) contextoIA = 'PRIVADO';
            else if (esTicketTrade) contextoIA = 'TRADE_ELGRINGO';
            else {
                // Lógica simple para detectar tipo de soporte por nombre del canal o mensaje
                const nombreCanal = message.channel.name.toLowerCase();
                if (nombreCanal.includes('alianza')) contextoIA = 'SOPORTE_ALIANZAS';
                else if (nombreCanal.includes('report')) contextoIA = 'SOPORTE_REPORTES';
                else if (nombreCanal.includes('premio')) contextoIA = 'SOPORTE_PREMIOS';
            }

            const respuesta = await gestionarIA(message.content, contextoIA);
            await message.reply(respuesta);
        }
    }
};
