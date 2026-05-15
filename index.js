const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField,
ModalBuilder,
TextInputBuilder,
TextInputStyle
} = require("discord.js");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers
]
});

const TOKEN = process.env.TOKEN;

const store = new Map();

/* ================= ONLINE STATUS ================= */

client.once("ready", () => {
console.log(`✔ Bot online jako ${client.user.tag}`);

client.user.setPresence({
activities: [
{
name: "RP Server běží...",
type: 0
}
],
status: "online"
});
});

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
"Co je Unreal RP?"
];

/* ================= MAIN ================= */

client.on("interactionCreate", async (i) => {

/* ================= /ticket ================= */

if (i.isChatInputCommand() && i.commandName === "ticket") {

const embed = new EmbedBuilder()
.setTitle("🎫 TICKET SYSTEM")
.setDescription("Vyber typ ticketu")
.setColor("Orange");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.addOptions([
{ label: "🛠 Podpora", value: "support" },
{ label: "⚠ Report", value: "report" },
{ label: "🏛 Frakce", value: "fraction" }
]);

return i.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)],
ephemeral: true
});
}

/* ================= TICKET MENU ================= */

if (i.isStringSelectMenu() && i.customId === "ticket_menu") {

let text = "";

if (i.values[0] === "support") text = "🛠 Popiš problém:";
if (i.values[0] === "report") text = "⚠ Report:\nID:\nDůkaz:\nČas:";
if (i.values[0] === "fraction") text = "🏛 Frakce:\nNázev:\nLore:\nCíl:";

const ch = await i.guild.channels.create({
name: `ticket-${i.values[0]}-${i.user.username}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
{ id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
]
});

const embed = new EmbedBuilder()
.setTitle("🎫 TICKET")
.setDescription(text)
.setColor("Orange");

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close")
.setLabel("❌ Close")
.setStyle(ButtonStyle.Danger)
);

await ch.send({ embeds: [embed], components: [row] });

return i.reply({ content: `✔ Ticket: ${ch}`, ephemeral: true });
}

/* ================= CLOSE ================= */

if (i.isButton() && i.customId === "close") {
await i.channel.delete().catch(()=>{});
}

/* ================= VERIFY ================= */

if (i.isChatInputCommand() && i.commandName === "verify") {

const embed = new EmbedBuilder()
.setTitle("🔐 VERIFY")
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

const role = i.guild.roles.cache.find(r =>
r.name.toLowerCase().includes("verify")
);

if (role) await i.member.roles.add(role).catch(()=>{});

return i.reply({ content: "✔ Ověřen", ephemeral: true });
