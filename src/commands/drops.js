const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drops')
        .setDescription('Suelta una recompensa rápida en el canal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Solo Admins
    async execute(interaction) {
        const embedDrop = new EmbedBuilder()
            .setTitle('🎁 ¡DROP RELÁMPAGO DEL MANAGER!')
            .setDescription('¡Atención! Se ha detectado un paquete de suministros.\n\nEl primero en presionar el botón de abajo se lleva la recompensa.')
            .addFields({ name: 'Estado:', value: '🟢 Disponible', inline: true })
            .setColor('#ff006e') // Color Rosa Eléctrico
            .setImage('https://i.imgur.com/8N7mZ6p.png') // Imagen de un cofre (puedes cambiarla)
            .setFooter({ text: 'Sistema de Recompensas ElGringo' });

        const filaBoton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_drop')
                .setLabel('¡RECLAMAR AHORA! 🏆')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embedDrop], components: [filaBoton] });
    },
};
