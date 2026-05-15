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
GatewayIntentBits.MessageContent
]
});

const TOKEN = process.env.TOKEN;

// 📡 LOG KANÁL (SEM DEJ ID)
const TICKET_LOG_CHANNEL_ID = "15030570402711228";

/* =========================
READY + COMMANDY
========================= */

client.once("ready", async () => {
console.log(`${client.user.tag} ONLINE`);

const commands = [
new SlashCommandBuilder().setName("ticketpanel").setDescription("📡 Otevře RP ticket panel"),
new SlashCommandBuilder().setName("server").setDescription("🌐 Info o serveru"),
new SlashCommandBuilder().setName("pravidla").setDescription("📜 Pravidla serveru")
].map(c => c.toJSON());

await client.application.commands.set(commands);
});

/* =========================
COMMANDS
========================= */

client.on("interactionCreate", async interaction => {

if (interaction.isChatInputCommand()) {

/* 🎫 PANEL */
if (interaction.commandName === "ticketpanel") {

const embed = new EmbedBuilder()
.setTitle("📡 PRAGUE RP • DISPATCH SYSTEM")
.setDescription(`
━━━━━━━━━━━━━━━━━━
📄 **TICKET SYSTÉM**

📌 Vyber typ žádosti níže

🚓 Frakce žádost
🛠 Support
🚨 Report hráče
💬 Všeobecná pomoc

━━━━━━━━━━━━━━━━━━
⚠️ Pravidla:
• žádný spam
• RP chování
• respektuj adminy

━━━━━━━━━━━━━━━━━━
`)
.setColor("DarkBlue")
.setFooter({ text: "PRAGUE RP • Dispatch Center" });

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("📄 Vyber typ ticketu")
.addOptions([
{ label: "🚓 Frakce", value: "faction" },
{ label: "🛠 Support", value: "support" },
{ label: "🚨 Report", value: "report" },
{ label: "💬 Pomoc", value: "help" }
]);

interaction.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)]
});
}

/* SERVER INFO */
if (interaction.commandName === "server") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🌐 SERVER INFO")
.setDescription("PRAGUE RP • Serious RP • Tickets • Frakce")
.setColor("Blue")
]
});
}

/* PRAVIDLA */
if (interaction.commandName === "pravidla") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📜 PRAVIDLA")
.setDescription("❌ RDM ❌ VDM ❌ FailRP ✔ Serious RP")
.setColor("Red")
]
});
}

}

/* =========================
TICKET SYSTEM
========================= */

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "ticket_menu") {

const type = interaction.values[0];

// 📁 VYTVOŘENÍ KANÁLU
const channel = await interaction.guild.channels.create({
name: `📁-${type}-${interaction.user.username}`.toLowerCase(),
type: ChannelType.GuildText,

permissionOverwrites: [
{
id: interaction.guild.id,
deny: ["ViewChannel"]
},
{
id: interaction.user.id,
allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
}
]
});

// 🔓 ADMIN ACCESS AUTOMATICKY
interaction.guild.roles.cache.forEach(role => {
if (role.permissions.has(PermissionFlagsBits.Administrator)) {
channel.permissionOverwrites.edit(role, {
ViewChannel: true,
SendMessages: true,
ReadMessageHistory: true
});
}
});

/* =========================
RP FORMULÁŘE
========================= */

let form = "";

if (type === "faction") {
form = `
🚓 FRAKČNÍ ŽÁDOST

1️⃣ Název frakce:
2️⃣ Typ (PD / EMS / Gang / Civil):
3️⃣ Detailní popis:
4️⃣ Lore (příběh):
5️⃣ Počet členů:
6️⃣ RP zkušenosti:
7️⃣ Proč chcete schválení:
`;
}

if (type === "report") {
form = `
🚨 REPORT HRÁČE

1️⃣ Jméno hráče:
2️⃣ ID hráče:
3️⃣ Co udělal:
4️⃣ Datum a čas:
5️⃣ Místo:
6️⃣ Důkaz:
7️⃣ Další info:
`;
}

if (type === "support") {
form = `
🛠 SUPPORT

1️⃣ Problém:
2️⃣ Kdy nastal:
3️⃣ Co jsi zkusil:
4️⃣ Důkaz:
5️⃣ Další info:
`;
}

if (type === "help") {
form = `
💬 POMOC

1️⃣ Co potřebuješ:
2️⃣ Popis situace:
3️⃣ Co jsi zkusil:
`;
}

/* EMBED V TICKU */
const embed = new EmbedBuilder()
.setTitle(`📄 TICKET • ${type.toUpperCase()}`)
.setDescription(`
👤 **Žadatel:** ${interaction.user}

━━━━━━━━━━━━━━━━━━
${form}

━━━━━━━━━━━━━━━━━━
📡 čekej na odpověď administrace
`)
.setColor("Green");

/* BUTTONY */
const claim = new ButtonBuilder()
.setCustomId("ticket_claim")
.setLabel("👮 Claim")
.setStyle(ButtonStyle.Success);

const close = new ButtonBuilder()
.setCustomId("ticket_close")
.setLabel("🔒 Close")
.setStyle(ButtonStyle.Danger);

channel.send({
content: `<@${interaction.user.id}>`,
embeds: [embed],
components: [new ActionRowBuilder().addComponents(claim, close)]
});

/* LOG SYSTEM */
const logChannel = interaction.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);

if (logChannel) {
logChannel.send({
embeds: [
new EmbedBuilder()
.setTitle("📡 NOVÝ TICKET")
.setDescription(`
👤 Uživatel: ${interaction.user.tag}
📄 Typ: ${type}
📁 Kanál: ${channel}
`)
.setColor("Blue")
]
});
}

interaction.reply({
content: `✔ Ticket vytvořen: ${channel}`,
ephemeral: true
});
}
}

/* =========================
BUTTONY
========================= */

if (interaction.isButton()) {

/* CLAIM */
if (interaction.customId === "ticket_claim") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("👮 CLAIMED")
.setDescription(`${interaction.user.tag} převzal ticket`)
.setColor("Green")
]
});
}

/* CLOSE */
if (interaction.customId === "ticket_close") {
await interaction.reply("🔒 Zavírám ticket...");
setTimeout(() => interaction.channel.delete(), 3000);
}

}

});

client.login(TOKEN);
