const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = [
    // COMANDO /SAY
    {
        data: new SlashCommandBuilder()
            .setName('say')
            .setDescription('Haz que el bot diga algo con estilo')
            .addStringOption(option => option.setName('mensaje').setDescription('Qué quieres decir').setRequired(true)),
        async execute(interaction) {
            const texto = interaction.options.getString('mensaje');
            // Usamos formato de bloque de código para una "letra bonita"
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`\`\`\`\n${texto}\n\`\`\``);
            await interaction.reply({ embeds: [embed] });
        }
    },

    // COMANDO /DROPS
    {
        data: new SlashCommandBuilder()
            .setName('drops')
            .setDescription('Lanza un drop rápido')
            .addStringOption(option => option.setName('item').setDescription('Qué estás dropeando').setRequired(true)),
        async execute(interaction) {
            const item = interaction.options.getString('item');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_drop')
                    .setLabel('🎁 RECLAMAR')
                    .setStyle(ButtonStyle.Success)
            );

            const embed = new EmbedBuilder()
                .setTitle('🎊 ¡NUEVO DROP DISPONIBLE!')
                .setDescription(`El primero en darle al botón se lleva: **${item}**`)
                .setColor('#f1c40f');

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    },

    // COMANDO /SORTEO
    {
        data: new SlashCommandBuilder()
            .setName('sorteo')
            .setDescription('Crea un sorteo con roles')
            .addStringOption(option => option.setName('premio').setDescription('Qué sorteas').setRequired(true))
            .addStringOption(option => option.setName('imagen').setDescription('URL de la imagen').setRequired(false)),
        async execute(interaction) {
            const premio = interaction.options.getString('premio');
            const imagen = interaction.options.getString('imagen');

            const embed = new EmbedBuilder()
                .setTitle(`🎉 SORTEO: ${premio}`)
                .setDescription('¡Participa usando los botones de abajo!\n\n🔵 **REAL:** 1 Entrada\n🚀 **BOOSTER:** 2 Entradas')
                .setColor('#5865f2');
            
            if (imagen) embed.setImage(imagen);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('join_real').setLabel('Participar (REAL)').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('join_booster').setLabel('Participar (BOOSTER)').setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
];
