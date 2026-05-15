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

const claims = new Map();

/* =========================
READY + COMMANDS
========================= */

client.once("ready", async () => {
console.log(`${client.user.tag} ONLINE`);

const commands = [

new SlashCommandBuilder().setName("ticketpanel").setDescription("📡 Otevře RP ticket systém"),
new SlashCommandBuilder().setName("server").setDescription("🌐 Informace o serveru"),
new SlashCommandBuilder().setName("verify").setDescription("🔐 Ověření hráče"),
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
📡 **Status:** Online RP server

🎫 Ticket systém: Aktivní
⏱ Odpověď: 5–30 minut (RP provoz)
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
content: "✔ Ověření proběhlo úspěšně",
ephemeral: true
});
}

/* 📡 TICKET PANEL */
if (interaction.commandName === "ticketpanel") {

const embed = new EmbedBuilder()
.setTitle("📡 PRAGUE RP • DISPATCH CENTRUM")
.setDescription(`
━━━━━━━━━━━━━━━━━━
👋 **Vítej v ticket systému**

Tento systém slouží pro komunikaci s administrací serveru.

━━━━━━━━━━━━━━━━━━
📌 **PRAVIDLA TICKETŮ**
• Nezakládej spam tickety
• Piš pravdivé informace
• Respektuj RP styl komunikace
• Čekej na odpověď (5–30 minut)

━━━━━━━━━━━━━━━━━━
⏱ **PRACOVNÍ DOBA**
🟢 Aktivní: 12:00 – 22:00
🔴 Mimo dobu: odpověď se může zpozdit

━━━━━━━━━━━━━━━━━━
📋 **TYPY ŽÁDOSTÍ**
🚓 Frakční žádost
🛠 Technická podpora
🚨 Nahlášení hráče
💬 Všeobecná pomoc

━━━━━━━━━━━━━━━━━━
`)
.setColor("DarkBlue")
.setFooter({ text: "PRAGUE RP • TicketKing Style System" });

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("📄 Vyber typ žádosti")
.addOptions([
{ label: "🚓 Frakce žádost", value: "faction" },
{ label: "🛠 Technická podpora", value: "support" },
{ label: "🚨 Nahlášení hráče", value: "report" },
{ label: "💬 Všeobecná pomoc", value: "help" }
]);

return interaction.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)]
});
}

/* =========================
TICKETS
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

/* ================= FORMULÁŘE ================= */

let form = "";

if (type === "faction") form = `
🚓 FRAKČNÍ ŽÁDOST

1️⃣ Název frakce
2️⃣ Typ (PD / EMS / Gang / Civil)
3️⃣ Detailní popis
4️⃣ Lore (příběh)
5️⃣ Počet členů
6️⃣ RP zkušenosti
7️⃣ Proč by měla být schválena
`;

if (type === "report") form = `
🚨 NÁHLÁŠENÍ HRÁČE

1️⃣ Jméno / ID hráče
2️⃣ Co přesně udělal
3️⃣ Datum a čas události
4️⃣ Místo
5️⃣ Porušené pravidlo
6️⃣ Důkaz (video / screenshot)
7️⃣ Další informace
`;

if (type === "support") form = `
🛠 TECHNICKÁ PODPORA

1️⃣ Popis problému
2️⃣ Kdy se objevil
3️⃣ Co jsi zkusil
4️⃣ Screenshot / video
5️⃣ Další informace
`;

if (type === "help") form = `
💬 VŠEOBECNÁ POMOC

1️⃣ S čím potřebuješ pomoct
2️⃣ Detail situace
3️⃣ Co jsi zkusil
4️⃣ Co očekáváš
`;

/* ================= TICKET EMBED ================= */

const embed = new EmbedBuilder()
.setTitle(`📄 TICKET • ${type.toUpperCase()}`)
.setDescription(`
👤 **Žadatel:** ${interaction.user}

━━━━━━━━━━━━━━━━━━
📌 **Vyplň prosím formulář níže:**

${form}

━━━━━━━━━━━━━━━━━━
⏱ Odpověď administrace: 5–30 minut
📡 Status: Čeká na zpracování
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
👤 Uživatel: ${interaction.user.tag}
📄 Typ: ${type}
📁 Kanál: ${channel}
⏱ Status: Otevřen
`)
.setColor("Blue")
]
});
}

return interaction.reply({ content: `✔ Ticket vytvořen: ${channel}`, ephemeral: true });
}
}

/* =========================
BUTTONS
========================= */

if (interaction.isButton()) {

/* CLAIM */
if (interaction.customId === "claim") {

claims.set(interaction.channel.id, interaction.user.id);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("👮 TICKET CLAIMED")
.setDescription(`Ticket převzal: ${interaction.user}`)
.setColor("Green")
]
});
}

/* CLOSE */
if (interaction.customId === "close") {

await interaction.reply("🔒 Uzavírám ticket...");

setTimeout(() => {
interaction.channel.delete().catch(() => {});
}, 2000);
}

}

});

client.login(TOKEN);
