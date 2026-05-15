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

/* =========================
READY
========================= */

client.once("ready", async () => {
console.log(`${client.user.tag} online`);

const commands = [
new SlashCommandBuilder().setName("ticketpanel").setDescription("Ticket systém"),
new SlashCommandBuilder().setName("server").setDescription("Info"),
new SlashCommandBuilder().setName("pravidla").setDescription("Pravidla"),
new SlashCommandBuilder().setName("help").setDescription("Příkazy"),
new SlashCommandBuilder()
.setName("clear")
.setDescription("Smaže zprávy")
.addIntegerOption(opt =>
opt.setName("počet").setDescription("Počet").setRequired(true)
)
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
.setTitle("🎫 TICKET SYSTEM")
.setDescription("Vyber typ ticketu:")
.setColor("Purple");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Vyber ticket")
.addOptions([
{ label: "Support", value: "support", description: "Technická pomoc" },
{ label: "Allowlist", value: "allowlist", description: "Allowlist pomoc" },
{ label: "Frakce", value: "faction", description: "Žádost o frakci" },
{ label: "Report", value: "report", description: "Nahlášení hráče" },
{ label: "Všeobecná pomoc", value: "general_help", description: "Obecná pomoc" }
]);

interaction.reply({
embeds: [embed],
components: [new ActionRowBuilder().addComponents(menu)]
});
}

/* 🌐 SERVER */
if (interaction.commandName === "server") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🌐 SERVER INFO")
.setDescription("RP server • Ticket system • Staff tým")
.setColor("Purple")
]
});
}

/* 📜 PRAVIDLA */
if (interaction.commandName === "pravidla") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📜 PRAVIDLA")
.setDescription("❌ RDM ❌ VDM ❌ FailRP ✔ Serious RP")
.setColor("Purple")
]
});
}

/* 📚 HELP */
if (interaction.commandName === "help") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📚 HELP")
.setDescription("/ticketpanel /server /pravidla /clear")
.setColor("Purple")
]
});
}

/* 🧹 CLEAR */
if (interaction.commandName === "clear") {

if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
return interaction.reply({ content: "❌ Nemáš práva", ephemeral: true });

const amount = interaction.options.getInteger("počet");
await interaction.channel.bulkDelete(amount);

interaction.reply({ content: `✔ Smazáno ${amount}`, ephemeral: true });
}

}

/* =========================
TICKETS
========================= */

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "ticket_menu") {

const type = interaction.values[0];

const channel = await interaction.guild.channels.create({
name: `ticket-${interaction.user.username}`,
type: ChannelType.GuildText
});

let form = "";

/* SUPPORT */
if (type === "support") {
form = `
# 🛠 SUPPORT
1. Problém
2. Kdy nastal
3. Popis
`;
}

/* ALLOWLIST */
if (type === "allowlist") {
form = `
# 📝 ALLOWLIST
1. Discord jméno
2. Popis problému
3. Informace
`;
}

/* FRAKCE */
if (type === "faction") {
form = `
# 🚔 ŽÁDOST O FRAKCI
1. Název
2. Typ
3. RP zkušenosti
4. Lore
5. Důvod
`;
}

/* REPORT */
if (type === "report") {
form = `
# 🚨 REPORT
1. Hráč
2. Problém
3. Důkazy
`;
}

/* HELP */
if (type === "general_help") {
form = `
# 💬 VŠEOBECNÁ POMOC
1. Dotaz
2. Popis
3. Informace
`;
}

const embed = new EmbedBuilder()
.setTitle("📋 TICKET")
.setDescription(form)
.setColor("Purple");

const claim = new ButtonBuilder()
.setCustomId("ticket_claim")
.setLabel("Claim")
.setStyle(ButtonStyle.Success);

const close = new ButtonBuilder()
.setCustomId("ticket_close")
.setLabel("Close")
.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(claim, close);

channel.send({
content: `<@${interaction.user.id}>`,
embeds: [embed],
components: [row]
});

interaction.reply({
content: `✔ Ticket vytvořen: ${channel}`,
ephemeral: true
});
}
}

/* =========================
BUTTONS
========================= */

if (interaction.isButton()) {

/* CLAIM */
if (interaction.customId === "ticket_claim") {
interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("👮 Claimed")
.setDescription(`${interaction.user.tag} převzal ticket`)
.setColor("Green")
]
});
}

/* CLOSE */
if (interaction.customId === "ticket_close") {
await interaction.reply("🔒 Zavírám ticket...");
setTimeout(() => interaction.channel.delete(), 4000);
}

}

});

client.login(TOKEN);
