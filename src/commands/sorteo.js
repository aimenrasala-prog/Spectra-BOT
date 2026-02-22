const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Lista temporal en memoria (Se limpia si el bot se apaga, pero es lo más rápido ahora)
let participantes = [];
let premioActual = "";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sorteo')
        .setDescription('Gestión de sorteos para el Manager')
        .addSubcommand(sub => 
            sub.setName('iniciar')
               .setDescription('Lanza un nuevo sorteo')
               .addStringOption(opt => opt.setName('premio').setDescription('¿Qué sorteas?').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('control')
               .setDescription('SOLO DUEÑO: Ver estadísticas del sorteo')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // --- 1. LÓGICA PARA INICIAR EL SORTEO ---
        if (sub === 'iniciar') {
            // Restricción de Roles (Pon aquí tus IDs)
            const rolesAutorizados = ['ID_DEL_ROL_1', 'ID_DEL_ROL_2']; 
            const tienePermiso = interaction.member.roles.cache.some(r => rolesAutorizados.includes(r.id)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!tienePermiso) {
                return interaction.reply({ content: '❌ No tienes permiso para iniciar sorteos.', ephemeral: true });
            }

            participantes = []; // Reseteamos participantes
            premioActual = interaction.options.getString('premio');

            const embedSorteo = new EmbedBuilder()
                .setTitle('🎉 ¡GRAN SORTEO DEL MANAGER!')
                .setDescription(`El Manager está sorteando: **${premioActual}**\n\nPresiona el botón de abajo para entrar en la lista.`)
                .setColor('#f1c40f')
                .setFooter({ text: '¡Mucha suerte a todos!' });

            const fila = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('participar_sorteo')
                    .setLabel('¡PARTICIPAR! ✅')
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.reply({ embeds: [embedSorteo], components: [fila] });
        }

        // --- 2. LÓGICA DE CONTROL (SOLO PARA TI) ---
        if (sub === 'control') {
            // Cambia '1190409308601585764' por tu ID real de Discord
            if (interaction.user.id !== 'TU_ID_DE_USUARIO') {
                return interaction.reply({ content: '⛔ Solo el Dueño puede ver las estadísticas secretas.', ephemeral: true });
            }

            const listaParticipantes = participantes.length > 0 
                ? participantes.map(id => `<@${id}>`).join(', ') 
                : "Nadie ha participado aún.";

            const embedControl = new EmbedBuilder()
                .setTitle('📊 PANEL DE CONTROL DE SORTEO')
                .addFields(
                    { name: '🎁 Premio:', value: premioActual || "Ninguno", inline: true },
                    { name: '👥 Total Participantes:', value: `${participantes.length}`, inline: true },
                    { name: '👤 Lista de IDs:', value: listaParticipantes.substring(0, 1024) } // Discord corta a los 1024 caracteres
                )
                .setColor('#2ecc71');

            return interaction.reply({ embeds: [embedControl], ephemeral: true }); // El 'ephemeral: true' hace que SOLO TU lo veas
        }
    },

    // Esta parte ayuda al index.js a saber qué hacer cuando alguien pulsa el botón
    participantes: participantes
};
