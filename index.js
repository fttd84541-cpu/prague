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
intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const TOKEN = process.env.TOKEN;

/* ================= CONFIG ================= */

const OBCHANKA_CHANNEL_ID = "SEM_DEJ_ID_KANALU";

const store = new Map();

/* ================= SAFETY ================= */

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* ================= ROLE ================= */

function getAllowRole(guild) {
return guild.roles.cache.find(r =>
r.name.toLowerCase().includes("allow") ||
r.name.toLowerCase().includes("list")
);
}

function getVerifyRole(guild) {
return guild.roles.cache.find(r =>
r.name.toLowerCase().includes("verify") ||
r.name.includes("✔")
);
}

/* ================= QUESTIONS ================= */

const questions = [
"Co je RDM?",
"Co je VDM?",
"Co je NLR?",
"Co je FearRP?",
"Co je FailRP",
"Co je PowerGaming?",
"Co je MetaGaming?",
"Co je Mixing IC/OOC?",
"Co je Revenge Kill?",
"Co je Combat Logging",
"Co je Cop Baiting?",
"Co je NVL?",
"Co je Random Arrest?",
"Co je Fail Driving RP?",
"Co je Unreal RP chování?"
];

/* ================= READY ================= */

client.once("ready", async () => {
console.log("BOT ONLINE");

await client.application.commands.set([
{ name: "ticket", description: "🎫 ticket system" },
{ name: "alowlist", description: "📄 RP test" },
{ name: "verify", description: "🔐 verify" },
{ name: "info", description: "ℹ info serveru" },
{ name: "obcanka", description: "🪪 RP občanka" }
]);
});

/* ================= VERIFY ================= */

client.on("interactionCreate", async (i) => {

if (i.commandName === "verify") {

const embed = new EmbedBuilder()
.setTitle("🔐 VERIFIKACE")
.setDescription("Klikni pro ověření")
.setColor("Blue");

const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("verify_btn")
.setLabel("Ověřit")
.setStyle(ButtonStyle.Success)
);

return i.reply({ embeds: [embed], components: [btn] });
}

if (i.isButton() && i.customId === "verify_btn") {

const role = getVerifyRole(i.guild);
if (role) await i.member.roles.add(role).catch(()=>{});

return i.reply({ content: "✔ Ověřen", ephemeral: true });
}

/* ================= INFO ================= */

if (i.commandName === "info") {
return i.reply({
embeds: [
new EmbedBuilder()
.setTitle("ℹ SERVER INFO")
.setDescription(`👥 Členů: ${i.guild.memberCount}\n🎮 RP Server`)
.setColor("Green")
]
});
}

/* ================= TICKET ================= */

if (i.commandName === "ticket") {

const embed = new EmbedBuilder()
.setTitle("🎫 TICKET SYSTEM")
.setDescription("Podpora / Report / Frakce")
.setColor("Orange");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.addOptions([
{ label: "Podpora", value: "support" },
{ label: "Report hráče", value: "report" },
{ label: "Frakce", value: "fraction" }
]);

return i.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)]
});
}

/* ================= TICKET CREATE ================= */

if (i.isStringSelectMenu() && i.customId === "ticket_menu") {

let form = "";

if (i.values[0] === "support") {
form = "🛠 Podpora\nPopiš problém:";
}

if (i.values[0] === "report") {
form = "⚠ Report\nID hráče:\nČas:\nDůkaz:";
}

if (i.values[0] === "fraction") {
form = "🏛 Frakce žádost\nNázev:\nLore:\nCíl:";
}

const ch = await i.guild.channels.create({
name: `ticket-${i.values[0]}-${i.user.username}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{ id: i.guild.id, deny: ["ViewChannel"] },
{ id: i.user.id, allow: ["ViewChannel","SendMessages"] }
]
});

const embed = new EmbedBuilder()
.setTitle("🎫 TICKET")
.setDescription(form)
.setColor("Orange");

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("claim").setLabel("📌 Claim").setStyle(ButtonStyle.Success),
new ButtonBuilder().setCustomId("close").setLabel("❌ Close").setStyle(ButtonStyle.Danger)
);

await ch.send({ embeds: [embed], components: [row] });

return i.reply({ content: `✔ Ticket vytvořen: ${ch}`, ephemeral: true });
}

/* ================= CLAIM / CLOSE ================= */

if (i.isButton() && i.customId === "claim") {
return i.reply({ content: `📌 Ticket převzal: ${i.user}`, ephemeral: false });
}

if (i.isButton() && i.customId === "close") {
await i.channel.delete().catch(()=>{});
}

/* ================= ALOWLIST ================= */

if (i.commandName === "alowlist") {

store.set(i.user.id, []);

const modal = new ModalBuilder()
.setCustomId("alow_1")
.setTitle("ALOWLIST 1/3");

for (let j = 0; j < 5; j++) {
modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId(`q${j}`)
.setLabel(questions[j])
.setStyle(TextInputStyle.Paragraph)
)
);
}

return i.showModal(modal);
}

/* ================= ALOWLIST STEPS ================= */

for (let step = 1; step <= 3; step++) {

if (i.isModalSubmit() && i.customId === `alow_${step}`) {

let arr = store.get(i.user.id) || [];

for (let j = 0; j < 5; j++) {
arr.push(i.fields.getTextInputValue(`q${j}`));
}

store.set(i.user.id, arr);

if (step < 3) {

const modal = new ModalBuilder()
.setCustomId(`alow_${step + 1}`)
.setTitle(`ALOWLIST ${step + 1}/3`);

for (let j = 0; j < 5; j++) {
modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId(`q${j}`)
.setLabel(questions[step * 5 + j])
.setStyle(TextInputStyle.Paragraph)
)
);
}

return i.showModal(modal);
}

/* FINAL */
const answers = store.get(i.user.id) || [];
let errors = 0;

const rules = [
["rdm","random"],
["vdm","vehicle"],
["nlr","new life"],
["fear","fearrp"],
["fail","failrp"]
];

for (let k = 0; k < answers.length; k++) {
const a = answers[k].toLowerCase();
const r = rules[k % rules.length];
if (!r.some(x => a.includes(x))) errors++;
}

const pass = errors <= 4;

const role = getAllowRole(i.guild);

if (pass && role) {
await i.member.roles.add(role).catch(()=>{});
}

store.delete(i.user.id);

return i.reply({
content: pass ? `✔ PROŠEL (${errors})` : `✖ NEPROŠEL (${errors})`,
ephemeral: true
});
}
}

/* ================= OBČANKA ================= */

if (i.commandName === "obcanka") {

const embed = new EmbedBuilder()
.setTitle("🪪 RP OBČANKA")
.setDescription(
"📌 Pravidla:\n" +
"- 1 postava = 1 ekonomika\n" +
"- žádné extremistické názvy\n" +
"- RP musí být realistické\n\n" +
"📊 Občanka se ukládá do databáze serveru"
)
.setColor("Purple");

const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("obcanka_create")
.setLabel("🪪 Vytvořit občanku")
.setStyle(ButtonStyle.Primary)
);

return i.reply({ embeds: [embed], components: [btn] });
}

if (i.isButton() && i.customId === "obcanka_create") {

const modal = new ModalBuilder()
.setCustomId("obcanka_form")
.setTitle("RP OBČANKA");

const fields = [
"Jméno",
"Příjmení",
"Datum narození",
"Věk",
"Státní příslušnost"
];

fields.forEach((f, idx) => {
modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId(`f${idx}`)
.setLabel(f)
.setStyle(TextInputStyle.Short)
)
);
});

return i.showModal(modal);
}

if (i.isModalSubmit() && i.customId === "obcanka_form") {

const name = i.fields.getTextInputValue("f0");
const surname = i.fields.getTextInputValue("f1");
const birth = i.fields.getTextInputValue("f2");
const age = i.fields.getTextInputValue("f3");
const nation = i.fields.getTextInputValue("f4");

const embed = new EmbedBuilder()
.setTitle("🪪 NOVÁ RP OBČANKA")
.setColor("Gold")
.setDescription(
`👤 ${name} ${surname}\n` +
`🎂 ${birth}\n` +
`📊 ${age} let\n` +
`🌍 ${nation}`
);

const channel = i.guild.channels.cache.get(OBCHANKA_CHANNEL_ID);

if (channel) {
await channel.send({ embeds: [embed] });
}

return i.reply({
content: "✔ Občanka uložena do databáze",
ephemeral: true
});
}

});

client.login(TOKEN);
