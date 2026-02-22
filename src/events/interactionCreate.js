module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId === 'claim_drop') {
                await interaction.update({ content: `✅ Drop ganado por: ${interaction.user}`, embeds: [], components: [] });
                // Enviar log al canal de staff
                const logs = interaction.guild.channels.cache.get(process.env.ID_CANAL_LOGS);
                if (logs) logs.send(`🎁 **Drop reclamado:** ${interaction.user.tag} ganó un item.`);
            }

            if (interaction.customId.startsWith('join_')) {
                // Aquí solo confirmamos la participación
                await interaction.reply({ content: '✅ ¡Has entrado en el sorteo! El Staff revisará los ganadores.', ephemeral: true });
            }
        }

        if (!interaction.isChatInputCommand()) return;

        // Lógica para ejecutar los comandos slash (se añade en el index.js)
    }
};
