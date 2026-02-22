const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Envía un comunicado oficial a través del Manager')
        .addStringOption(option => 
            option.setName('mensaje')
                .setDescription('El contenido del mensaje')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Solo Staff puede usarlo
    async execute(interaction) {
        const texto = interaction.options.getString('mensaje');

        const embedSay = new EmbedBuilder()
            .setAuthor({ 
                name: 'COMUNICADO OFICIAL DEL MANAGER', 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setDescription(texto)
            .setColor('#00fbff') // Color Cian Neón
            .setTimestamp()
            .setFooter({ 
                text: `Emitido por: ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // Confirmación solo para ti
        await interaction.reply({ content: '✅ Comunicado enviado con éxito.', ephemeral: true });
        
        // El mensaje real en el canal
        await interaction.channel.send({ embeds: [embedSay] });
    },
};
