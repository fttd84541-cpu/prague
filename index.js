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

/* ================= CONFIG ================= */

const TOKEN = process.env.TOKEN;

const MAX_ERRORS = 4;

/* ================= STORAGE ================= */

const answersStore = new Map();

/* ================= ROLE FINDERS ================= */

function getAllowRole(guild) {
return guild.roles.cache.find(r =>
r.name.toLowerCase().includes("alow") &&
r.name.toLowerCase().includes("list")
);
}

function getVerifyRole(guild) {
return guild.roles.cache.find(r =>
r.name.toLowerCase().includes("ověřen") ||
r.name.toLowerCase().includes("security")
);
}

/* ================= AI CHECK ================= */

function isSuspicious(text) {
let t = text.toLowerCase();
let score = 0;

if (t.includes("je to situace kdy")) score++;
if (t.includes("znamená to že")) score++;
if (t.length > 900) score++;
if (t.split(".").length > 12) score++;
if (t.includes("as an ai")) score++;
if (t.includes("definice")) score++;

return score >= 3;
}

/* ================= READY ================= */

client.once("ready", async () => {
console.log("BOT ONLINE");

await client.application.commands.set([
{ name: "ticketpanel", description: "📨 Tickets" },
{ name: "verify", description: "🔐 Verify panel" },
{ name: "alowlist", description: "📄 Alowlist panel" }
]);
});

/* ================= MAIN ================= */

client.on("interactionCreate", async (interaction) => {

/* ================= VERIFY ================= */

if (interaction.commandName === "verify") {

const embed = new EmbedBuilder()
.setTitle("🔐 Ověření Security")
.setDescription("Klikni pro získání přístupu")
.setColor("Blue");

const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("verify_btn")
.setLabel("OVĚŘIT")
.setStyle(ButtonStyle.Primary)
);

return interaction.reply({ embeds: [embed], components: [btn] });
}

if (interaction.isButton() && interaction.customId === "verify_btn") {

const role = getVerifyRole(interaction.guild);
if (role) await interaction.member.roles.add(role);

return interaction.reply({
content: "✔ Ověření dokončeno",
ephemeral: true
});
}

/* ================= TICKETS ================= */

if (interaction.commandName === "ticketpanel") {

const embed = new EmbedBuilder()
.setTitle("📨 SUPPORT SYSTEM")
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

if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {

const channel = await interaction.guild.channels.create({
name: `ticket-${interaction.values[0]}-${interaction.user.username}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{ id: interaction.guild.id, deny: ["ViewChannel"] },
{ id: interaction.user.id, allow: ["ViewChannel","SendMessages"] }
]
});

return interaction.reply({
content: `✔ Ticket vytvořen: ${channel}`,
ephemeral: true
});
}

/* ================= ALOWLIST PANEL ================= */

if (interaction.commandName === "alowlist") {

const embed = new EmbedBuilder()
.setTitle("📄 ALOWLIST SYSTEM")
.setDescription("Start RP testu (25 otázek)")
.setColor("Blue");

const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("alow_start")
.setLabel("START TEST")
.setStyle(ButtonStyle.Success)
);

return interaction.reply({ embeds: [embed], components: [btn] });
}

/* ================= START ================= */

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
.setLabel(`Otázka ${i}`)
.setStyle(TextInputStyle.Paragraph)
)
);
}

return interaction.showModal(modal);
}

/* ================= MULTI STEP ================= */

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
.setLabel(`Otázka ${i + step * 5}`)
.setStyle(TextInputStyle.Paragraph)
)
);
}

return interaction.showModal(modal);
}

/* ================= FINAL ================= */

const answers = answersStore.get(interaction.user.id);

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

const suspicious = isSuspicious(answers.join(" "));
const pass = errors <= MAX_ERRORS && !suspicious;

const allowRole = getAllowRole(interaction.guild);
const verifyRole = getVerifyRole(interaction.guild);

if (pass) {
if (allowRole) await interaction.member.roles.add(allowRole);
await interaction.user.send("✔ ALOWLIST SCHVÁLEN").catch(()=>{});
} else {
await interaction.user.send("✖ ALOWLIST ZAMÍTNUT").catch(()=>{});
}

answersStore.delete(interaction.user.id);

return interaction.reply({
content: pass ? `✔ PASS (${errors})` : `✖ FAIL (${errors})`,
ephemeral: true
});
}
});

client.login(TOKEN);
