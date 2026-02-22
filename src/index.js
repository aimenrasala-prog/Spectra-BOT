require('dotenv').config();
// 1. Separamos bien las librerías
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const path = require('path'); // Corregido: fuera de las llaves
const fs = require('fs');     // Corregido: fuera de las llaves
const { gestionarIA } = require('./utils/aiHandler');

// Configuración del Cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
let contadorMensajes = 0;
const INSULTOS = ['pendejo', 'estupido', 'idiota']; 

// 2. Cargar Comandos Slash (Sistema robusto)
const commandsJSON = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const commandList = require(path.join(commandsPath, file));
        // Verificamos si es un array de comandos o uno solo
        if (Array.isArray(commandList)) {
            commandList.forEach(cmd => {
                client.commands.set(cmd.data.name, cmd);
                commandsJSON.push(cmd.data.toJSON());
            });
        } else {
            client.commands.set(commandList.data.name, commandList);
            commandsJSON.push(commandList.data.toJSON());
        }
    }
}

// 3. Evento: Bot Listo
client.once('ready', async () => {
    console.log(`✅ ¡Bot online como ${client.user.tag}!`);
    try {
        await client.application.commands.set(commandsJSON);
        console.log("🚀 Comandos Slash registrados.");
    } catch (error) {
        console.error("Error registrando comandos:", error);
    }
});

// 4. Bienvenidas (15 seg)
client.on('guildMemberAdd', async (member) => {
    const canalGeneral = member.guild.channels.cache.get(process.env.ID_CANAL_GENERAL);
    if (!canalGeneral) return;
    const msg = await canalGeneral.send(`👋 ¡Bienvenido ${member}! Disfruta del servidor.`);
    setTimeout(() => msg.delete().catch(() => {}), 15000);
});

// 5. Mensajes (IA, Moderación y Trade)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // MODERACIÓN
    const texto = message.content.toLowerCase();
    const palabras = message.content.split(' ').filter(p => p.length > 2);
    const mayusculas = palabras.filter(p => p === p.toUpperCase());

    if (mayusculas.length > 3 || INSULTOS.some(insulto => texto.includes(insulto))) {
        if (message.deletable) await message.delete().catch(() => {});
        return message.channel.send(`⚠️ ${message.author}, modera tu lenguaje/mayúsculas.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // RECORDATORIO TRADE
    if (message.channel.id === process.env.ID_CANAL_GENERAL) {
        contadorMensajes++;
        if (contadorMensajes >= 7) {
            contadorMensajes = 0;
            await message.channel.send("📢 **SI QUIERES TRADEAR CON EL STAFF ABRE TICKET EN #MIDLEMAN Y ELIGE LA OPCIÓN DE TRADE ELGRINGO**");
        }
    }

    // RESPUESTA DE LA IA
    const esPrivado = message.author.id === process.env.ID_TU_USUARIO_ID && message.channel.id === process.env.ID_CANAL_IA_PRIVADO;
    const esTicketSoporte = message.channel.parentId === process.env.ID_CAT_SOPORTE;
    const esTicketTrade = message.channel.parentId === process.env.ID_CAT_TRADE;

    if (esPrivado || esTicketSoporte || esTicketTrade) {
        await message.channel.sendTyping();
        let contextoIA = 'GENERAL';
        
        if (esPrivado) contextoIA = 'PRIVADO';
        else if (esTicketTrade) contextoIA = 'TRADE_ELGRINGO';
        else {
            const nombreCanal = message.channel.name.toLowerCase();
            if (nombreCanal.includes('alianza')) contextoIA = 'SOPORTE_ALIANZAS';
            else if (nombreCanal.includes('report')) contextoIA = 'SOPORTE_REPORTES';
            else if (nombreCanal.includes('premio')) contextoIA = 'SOPORTE_PREMIOS';
        }

        try {
            const respuesta = await gestionarIA(message.content, contextoIA);
            await message.reply(respuesta);
        } catch (err) {
            console.error("Error Gemini:", err);
            await message.reply("❌ Hubo un error con Gemini. Revisa los logs de Railway.");
        }
    }
});

// 6. Interacciones
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'claim_drop') {
            await interaction.update({ content: `✅ Drop ganado por: ${interaction.user}`, embeds: [], components: [] });
            const logs = interaction.guild.channels.cache.get(process.env.ID_CANAL_LOGS);
            if (logs) logs.send(`🎁 **Drop reclamado:** ${interaction.user.tag}`);
        }
        if (interaction.customId.startsWith('join_')) {
            await interaction.reply({ content: '✅ ¡Inscrito!', ephemeral: true });
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (e) {
        console.error(e);
        await interaction.reply({ content: 'Error al ejecutar comando.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
