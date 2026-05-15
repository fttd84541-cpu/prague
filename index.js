const {
Client,
GatewayIntentBits,
EmbedBuilder,
SlashCommandBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
StringSelectMenuBuilder,
PermissionFlagsBits
} = require("discord.js");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});

const TOKEN = process.env.TOKEN;

// 📡 LOG KANÁL
const LOG_CHANNEL_ID = "15030570402711228";

const ticketClaims = new Map();
const ticketLocked = new Set();

/* =========================
READY + COMMANDS
========================= */

client.once("ready", async () => {
console.log(`${client.user.tag} ONLINE`);

const commands = [

new SlashCommandBuilder().setName("ticketpanel").setDescription("📡 Ticket systém"),
new SlashCommandBuilder().setName("server").setDescription("🌐 Info o serveru"),
new SlashCommandBuilder().setName("verify").setDescription("🔐 Verifikace"),
new SlashCommandBuilder().setName("claim").setDescription("👮 Claim ticket"),
new SlashCommandBuilder().setName("close").setDescription("🔒 Zavřít ticket"),
new SlashCommandBuilder().setName("lock").setDescription("🔒 Zamknout ticket"),
new SlashCommandBuilder().setName("unlock").setDescription("🔓 Odemknout ticket")

].map(c => c.toJSON());

await client.application.commands.set(commands);
});

/* =========================
COMMAND HANDLER
========================= */

client.on("interactionCreate", async interaction => {

/* 🌐 SERVER INFO */
if (interaction.commandName === "server") {

const g = interaction.guild;

const embed = new EmbedBuilder()
.setTitle(`🌐 ${g.name}`)
.setThumbnail(g.iconURL({ dynamic: true }))
.setDescription(`
👥 **Členové:** ${g.memberCount}

📡 **Status:** Aktivní RP komunita
🎫 **Ticket systém:** Online
`)
.setColor("Blue");

return interaction.reply({ embeds: [embed] });
}

/* 🔐 VERIFY */
if (interaction.commandName === "verify") {

const role = interaction.guild.roles.cache.find(r => r.name === "Verified");
if (!role) return interaction.reply("❌ Role Verified neexistuje");

await interaction.member.roles.add(role);

return interaction.reply({
content: "✔ Jsi ověřený hráč",
ephemeral: true
});
}

/* 📡 PANEL */
if (interaction.commandName === "ticketpanel") {

const embed = new EmbedBuilder()
.setTitle("📡 PRAGUE RP • DISPATCH CENTRUM")
.setDescription(`
━━━━━━━━━━━━━━━━━━
📄 **SYSTÉM ŽÁDOSTÍ**

Vyber si typ žádosti:

🚓 Frakce žádost
🛠 Technická podpora
🚨 Nahlášení hráče
💬 Všeobecná pomoc

━━━━━━━━━━━━━━━━━━
⚠️ Piš pravdivé informace a čekej na odpověď adminů
`)
.setColor("DarkBlue");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.addOptions([
{ label: "🚓 Frakce", value: "faction" },
{ label: "🛠 Support", value: "support" },
{ label: "🚨 Report", value: "report" },
{ label: "💬 Pomoc", value: "help" }
]);

return interaction.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)]
});
}

/* =========================
TICKETY
========================= */

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "ticket_menu") {

const type = interaction.values[0];

const channel = await interaction.guild.channels.create({
name: `📁-${type}-${interaction.user.username}`.toLowerCase(),
type: ChannelType.GuildText,

permissionOverwrites: [
{ id: interaction.guild.id, deny: ["ViewChannel"] },
{ id: interaction.user.id, allow: ["ViewChannel","SendMessages","ReadMessageHistory"] }
]
});

/* ADMIN ACCESS */
interaction.guild.roles.cache.forEach(role => {
if (role.permissions.has(PermissionFlagsBits.Administrator)) {
channel.permissionOverwrites.edit(role, {
ViewChannel: true,
SendMessages: true,
ReadMessageHistory: true
});
}
});

/* FORMULÁŘE */
let form = "";

if (type === "faction") form = `
🚓 FRAKČNÍ ŽÁDOST

1️⃣ Název frakce
2️⃣ Typ (PD / EMS / Gang / Civil)
3️⃣ Detailní popis
4️⃣ Lore (příběh frakce)
5️⃣ Počet členů
6️⃣ RP zkušenosti
7️⃣ Proč chcete schválení
`;

if (type === "report") form = `
🚨 Nahlášení hráče

1️⃣ Jméno / ID hráče
2️⃣ Co udělal
3️⃣ Datum a čas
4️⃣ Místo
5️⃣ Porušené pravidlo
6️⃣ Důkaz (video / screenshot)
7️⃣ Další informace
`;

if (type === "support") form = `
🛠 Technická podpora

1️⃣ Problém
2️⃣ Kdy nastal
3️⃣ Co jsi zkoušel
4️⃣ Důkaz
5️⃣ Další informace
`;

if (type === "help") form = `
💬 Všeobecná pomoc

1️⃣ S čím potřebuješ pomoct
2️⃣ Popis situace
3️⃣ Co jsi zkusil
4️⃣ Co očekáváš
`;

/* TICKET EMBED */
const embed = new EmbedBuilder()
.setTitle(`📄 TICKET • ${type.toUpperCase()}`)
.setDescription(`
👤 **Žadatel:** ${interaction.user}

━━━━━━━━━━━━━━━━━━
${form}

━━━━━━━━━━━━━━━━━━
📡 Administrace tě bude kontaktovat
`)
.setColor("Green");

/* BUTTONY */
const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("claim")
.setLabel("👮 Claim")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("close")
.setLabel("🔒 Close")
.setStyle(ButtonStyle.Danger)
);

await channel.send({
content: `<@${interaction.user.id}>`,
embeds: [embed],
components: [row]
});

/* LOG */
const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

if (log) {
log.send({
embeds: [
new EmbedBuilder()
.setTitle("📡 NOVÝ TICKET")
.setDescription(`
👤 ${interaction.user.tag}
📄 ${type}
📁 ${channel}
`)
.setColor("Blue")
]
});
}

return interaction.reply({ content: `✔ Ticket vytvořen: ${channel}`, ephemeral: true });
}
}

/* =========================
BUTTONY
========================= */

if (interaction.isButton()) {

/* CLAIM */
if (interaction.customId === "claim") {

ticketClaims.set(interaction.channel.id, interaction.user.id);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("👮 CLAIMED")
.setDescription(`${interaction.user} převzal ticket`)
.setColor("Green")
]
});
}

/* CLOSE */
if (interaction.customId === "close") {

await interaction.reply("🔒 Zavírám ticket...");

setTimeout(() => {
interaction.channel.delete().catch(() => {});
}, 2000);
}

}

});

client.login(TOKEN);
