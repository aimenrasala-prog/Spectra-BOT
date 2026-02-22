require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { gestionarIA } = require('./utils/aiHandler');

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

// 1. CARGA DE COMANDOS
const commandsJSON = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const commandList = require(path.join(commandsPath, file));
            if (Array.isArray(commandList)) {
                commandList.forEach(cmd => {
                    client.commands.set(cmd.data.name, cmd);
                    commandsJSON.push(cmd.data.toJSON());
                });
            } else {
                client.commands.set(commandList.data.name, commandList);
                commandsJSON.push(commandList.data.toJSON());
            }
        } catch (err) {
            console.error(`Error cargando comando ${file}:`, err);
        }
    }
}

// 2. EVENTO: BOT LISTO
client.once('ready', async () => {
    console.log(`✅ ¡Manager Online! Conectado como ${client.user.tag}`);
    try {
        await client.application.commands.set(commandsJSON);
        console.log("🚀 Comandos Slash actualizados.");
    } catch (error) {
        console.error("Error registrando comandos:", error);
    }
});

// 3. EVENTO: BIENVENIDA
client.on('guildMemberAdd', async (member) => {
    const canalBienvenida = member.guild.channels.cache.get(process.env.ID_CANAL_GENERAL) || 
                            member.guild.channels.cache.find(c => c.name.includes('bienvenida'));

    if (!canalBienvenida) return;

    const embedBienvenida = new EmbedBuilder()
        .setTitle(`✨ ¡Bienvenido a ${member.guild.name}!`)
        .setDescription(`Hola ${member}, soy el **Manager** oficial.\n\n📍 Disfruta del servidor y respeta las reglas.\n\n*Eres el miembro nº ${member.guild.memberCount}*`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor('#00ffcc');

    const msg = await canalBienvenida.send({ content: `¡Bienvenido ${member}!`, embeds: [embedBienvenida] });
    setTimeout(() => msg.delete().catch(() => {}), 20000);
});

// 4. EVENTO: MENSAJES (MODERACIÓN, RECORDATORIOS E IA)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const esStaff = message.member.permissions.has('Administrator') || 
                    message.member.permissions.has('ManageMessages');

    if (!esStaff) {
        const textoNorm = message.content.toLowerCase();
        const palabras = message.content.split(' ').filter(p => p.length > 2);
        const mayusculas = palabras.filter(p => p === p.toUpperCase());

        if (mayusculas.length > 4 || INSULTOS.some(insulto => textoNorm.includes(insulto))) {
            if (message.deletable) await message.delete().catch(() => {});
            const aviso = await message.channel.send(`⚠️ ${message.author}, modera tu lenguaje/mayúsculas.`);
            return setTimeout(() => aviso.delete().catch(() => {}), 5000);
        }
    }

    if (message.channel.id === process.env.ID_CANAL_GENERAL) {
        contadorMensajes++;
        if (contadorMensajes >= 15) {
            contadorMensajes = 0;
            const embedTrade = new EmbedBuilder()
                .setTitle('📢 RECORDATORIO DE TRADES')
                .setDescription("Si quieres realizar un **Trade con el Staff**, abre un ticket en el canal correspondiente y elige la opción **Trade Elgringo**.")
                .setColor('#f1c40f');
            await message.channel.send({ embeds: [embedTrade] });
        }
    }

    const esPrivado = message.author.id === process.env.ID_TU_USUARIO_ID && message.channel.id === process.env.ID_CANAL_IA_PRIVADO;
    const esTicket = message.channel.parentId === process.env.ID_CAT_SOPORTE || message.channel.parentId === process.env.ID_CAT_TRADE;
    const meMencionan = message.mentions.has(client.user);

    if (esPrivado || esTicket || meMencionan) {
        await message.channel.sendTyping();
        try {
            const contenidoLimpio = message.content.replace(/<@!?\d+>/g, "").trim();
            const respuesta = await gestionarIA(contenidoLimpio);
            await message.reply(respuesta);
        } catch (err) {
            console.error("Error en IA:", err);
        }
    }
});

// 5. INTERACCIONES (BOTONES Y COMANDOS)
client.on('interactionCreate', async (interaction) => {
    
    // --- LÓGICA DE BOTONES ---
    if (interaction.isButton()) {
        // Botón de Drops
        if (interaction.customId === 'claim_drop') {
            await interaction.update({ content: `✅ Drop reclamado por: ${interaction.user}`, embeds: [], components: [] });
            const logs = interaction.guild.channels.cache.get(process.env.ID_CANAL_LOGS);
            if (logs) logs.send(`🎁 **Drop reclamado:** ${interaction.user.tag}`);
        }

        // Botón de Sorteo
        if (interaction.customId === 'participar_sorteo') {
            const sorteoCmd = client.commands.get('sorteo');
            
            // Usamos una propiedad del comando para guardar participantes de forma sencilla
            if (!sorteoCmd.lista) sorteoCmd.lista = [];

            if (sorteoCmd.lista.includes(interaction.user.id)) {
                return interaction.reply({ content: '❌ Ya estás en la lista.', ephemeral: true });
            }

            sorteoCmd.lista.push(interaction.user.id);
            return interaction.reply({ content: `✅ ¡Registrado! Hay ${sorteoCmd.lista.length} participantes.`, ephemeral: true });
        }
        return;
    }

    // --- LÓGICA DE COMANDOS SLASH ---
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

const token = process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.BOT_TOKEN;
client.login(token).catch(err => console.error("❌ Error de Login:", err.message));
