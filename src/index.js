require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    EmbedBuilder, 
    path, 
    fs 
} = require('discord.js');
const { gestionarIA } = require('./utils/aiHandler');

// 1. Configuración del Cliente
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
const INSULTOS = ['pendejo', 'estupido', 'idiota']; // Puedes añadir más palabras aquí

// 2. Cargar Comandos Slash
const commandsJSON = [];
const commandsPath = require('path').join(__dirname, 'commands');
if (require('fs').existsSync(commandsPath)) {
    const commandFiles = require('fs').readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const commandList = require(require('path').join(commandsPath, file));
        commandList.forEach(cmd => {
            client.commands.set(cmd.data.name, cmd);
            commandsJSON.push(cmd.data.toJSON());
        });
    }
}

// 3. Evento: Bot Listo y Registro de Comandos
client.once('ready', async () => {
    console.log(`✅ ¡Bot online como ${client.user.tag}!`);
    await client.application.commands.set(commandsJSON);
    console.log("🚀 Comandos Slash registrados correctamente.");
});

// 4. Evento: Bienvenidas (15 segundos)
client.on('guildMemberAdd', async (member) => {
    const canalGeneral = member.guild.channels.cache.get(process.env.ID_CANAL_GENERAL);
    if (!canalGeneral) return;

    try {
        const msg = await canalGeneral.send(`👋 ¡Bienvenido ${member}! Disfruta del servidor.`);
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 15000);
    } catch (error) {
        console.error("Error en bienvenida:", error);
    }
});

// 5. Evento: Mensajes (IA, Moderación y Trade)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- MODERACIÓN ---
    const texto = message.content.toLowerCase();
    const palabras = message.content.split(' ').filter(p => p.length > 1);
    const mayusculas = palabras.filter(p => p === p.toUpperCase() && p.length > 2);

    if (mayusculas.length > 3 || INSULTOS.some(insulto => texto.includes(insulto))) {
        await message.delete().catch(() => {});
        return message.channel.send(`⚠️ ${message.author}, modera tu lenguaje o el uso de mayúsculas.`)
            .then(m => setTimeout(() => m.delete(), 5000));
    }

    // --- RECORDATORIO DE TRADE (Cada 7 mensajes en General) ---
    if (message.channel.id === process.env.ID_CANAL_GENERAL) {
        contadorMensajes++;
        if (contadorMensajes >= 7) {
            contadorMensajes = 0;
            await message.channel.send("📢 **SI QUIERES TRADEAR CON EL STAFF ABRE TICKET EN #MIDLEMAN Y ELIGE LA OPCIÓN DE TRADE ELGRINGO**");
        }
    }

    // --- RESPUESTA DE LA IA ---
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
            await message.reply("❌ Hubo un error procesando tu solicitud con la IA.");
        }
    }
});

// 6. Evento: Interacciones (Comandos Slash y Botones)
client.on('interactionCreate', async (interaction) => {
    // Manejo de Botones (Drops y Sorteos)
    if (interaction.isButton()) {
        if (interaction.customId === 'claim_drop') {
            await interaction.update({ content: `✅ Drop ganado por: ${interaction.user}`, embeds: [], components: [] });
            const logs = interaction.guild.channels.cache.get(process.env.ID_CANAL_LOGS);
            if (logs) logs.send(`🎁 **Drop reclamado:** ${interaction.user.tag} ganó un item.`);
        }
        if (interaction.customId.startsWith('join_')) {
            await interaction.reply({ content: '✅ ¡Has entrado en el sorteo! El Staff revisará los ganadores.', ephemeral: true });
        }
        return;
    }

    // Manejo de Comandos Slash
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
