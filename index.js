const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ChannelType
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

/* ================= SAFE STORAGE ================= */

const answersStore = new Map();

/* ================= RENDER SAFE LOGS ================= */

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* ================= ROLE FINDERS (EMOJI SAFE) ================= */

function getAllowRole(guild) {
return guild.roles.cache.find(r => {
const n = (r.name || "").toLowerCase();
return n.includes("alow") || n.includes("allow") || n.includes("list");
});
}

function getVerifyRole(guild) {
return guild.roles.cache.find(r => {
const n = r.name || "";
return (
n.includes("ověřen") ||
n.includes("security") ||
n.includes("✔") ||
n.includes("✓") ||
n.includes("🟩")
);
});
}

/* ================= READY ================= */

client.once("ready", async () => {
console.log("BOT ONLINE");

await client.application.commands.set([
{ name: "ticketpanel", description: "📨 Tickets system" },
{ name: "verify", description: "🔐 Verify panel" },
{ name: "alowlist", description: "📄 Alowlist panel" }
]);
});

/* ================= INTERACTIONS ================= */

client.on("interactionCreate", async (interaction) => {

/* ================= VERIFY PANEL ================= */

if (interaction.commandName === "verify") {

const embed = new EmbedBuilder()
.setTitle("🔐 Ověření Security")
.setDescription("Klikni pro získání přístupu na server")
.setColor("Blue");

const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("verify_btn")
.setLabel("OVĚŘIT")
.setStyle(ButtonStyle.Primary)
);

return interaction.reply({ embeds: [embed], components: [btn] });
}

/* VERIFY ACTION */

if (interaction.isButton() && interaction.customId === "verify_btn") {

const role = getVerifyRole(interaction.guild);

if (role) {
await interaction.member.roles.add(role).catch(() => {});
}

return interaction.reply({
content: "✔ Ověření dokončeno",
ephemeral: true
});
}

/* ================= TICKET PANEL ================= */

if (interaction.commandName === "ticketpanel") {

const embed = new EmbedBuilder()
.setTitle("📨 TICKET SYSTEM")
.setDescription("Vyber typ žádosti")
.setColor("DarkBlue");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.addOptions([
{ label: "🛠 Support", value: "support" },
{ label: "⚠ Report", value: "report" },
{ label: "🛡 Faction", value: "faction" }
]);

return interaction.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)]
});
}

/* CREATE TICKET */

if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {

const channel = await interaction.guild.channels.create({
name: `ticket-${interaction.values[0]}-${interaction.user.username}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{ id: interaction.guild.id, deny: ["ViewChannel"] },
{ id: interaction.user.id, allow: ["ViewChannel", "SendMessages"] }
]
});

return interaction.reply({
content: `✔ Ticket vytvořen: ${channel}`,
ephemeral: true
});
}

/* ================= ALOWLIST ================= */

if (interaction.commandName === "alowlist") {

const embed = new EmbedBuilder()
.setTitle("📄 ALOWLIST SYSTEM")
.setDescription("Start testu (25 otázek)")
.setColor("Blue");

const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("alow_start")
.setLabel("START")
.setStyle(ButtonStyle.Success)
);

return interaction.reply({ embeds: [embed], components: [btn] });
}

/* START TEST */

if (interaction.isButton() && interaction.customId === "alow_start") {

answersStore.set(interaction.user.id, []);

const modal = new ModalBuilder()
.setCustomId("alow_1")
.setTitle("ALOWLIST 1/5");

for (let i = 1; i <= 5; i++) {
modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId(`q${i}`)
.setLabel(`Otázka`)
.setStyle(TextInputStyle.Paragraph)
)
);
}

return interaction.showModal(modal);
}

/* ================= MULTISTEP SAFE ================= */

for (let step = 1; step <= 5; step++) {

if (interaction.isModalSubmit() && interaction.customId === `alow_${step}`) {

let arr = answersStore.get(interaction.user.id) || [];

for (let i = 1; i <= 5; i++) {
arr.push(interaction.fields.getTextInputValue(`q${i}`).toLowerCase());
}

answersStore.set(interaction.user.id, arr);

/* NEXT STEP */
if (step < 5) {

const modal = new ModalBuilder()
.setCustomId(`alow_${step + 1}`)
.setTitle(`ALOWLIST ${step + 1}/5`);

for (let i = 1; i <= 5; i++) {
modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId(`q${i}`)
.setLabel(`Otázka`)
.setStyle(TextInputStyle.Paragraph)
)
);
}

return interaction.showModal(modal);
}

/* ================= FINAL CHECK ================= */

const answers = answersStore.get(interaction.user.id) || [];

let errors = 0;

const rules = [
["rdm","random"],
["vdm","vehicle"],
["nlr","new life"],
["fear","fearrp"],
["fail","failrp"]
];

for (let i = 0; i < answers.length; i++) {
const a = answers[i];
const r = rules[i % rules.length];

if (!r.some(k => a.includes(k))) errors++;
}

const pass = errors <= 4;

const role = getAllowRole(interaction.guild);

if (pass && role) {
await interaction.member.roles.add(role).catch(() => {});
}

await interaction.user.send(
pass ? "✔ ALOWLIST SCHVÁLEN" : "✖ ALOWLIST ZAMÍTNUT"
).catch(() => {});

answersStore.delete(interaction.user.id);

return interaction.reply({
content: pass ? `✔ PASS (${errors})` : `✖ FAIL (${errors})`,
ephemeral: true
});
}
}
});

client.login(TOKEN);
