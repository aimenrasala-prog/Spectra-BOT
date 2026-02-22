module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const canalGeneral = member.guild.channels.cache.get(process.env.ID_CANAL_GENERAL);
        if (!canalGeneral) return;

        try {
            const msg = await canalGeneral.send(`👋 ¡Bienvenido ${member}! Disfruta del servidor.`);
            
            // Espera 15 segundos y borra el mensaje
            setTimeout(() => {
                msg.delete().catch(() => console.log("El mensaje de bienvenida ya no existe."));
            }, 15000);
        } catch (error) {
            console.error("Error en bienvenida:", error);
        }
    }
};
