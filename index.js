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

const TOKEN = MTUwNDc1MDUwMDI3MTM2MjA0OA.GOSfxd.DDVYjFdqLMhl3vjtgmOxLMjrxGqJ30jlQ6E7og;

/* =========================
READY + COMMANDY
========================= */

client.once("ready", async () => {

console.log(`${client.user.tag} online`);

const commands = [

new SlashCommandBuilder()
.setName("ticketpanel")
.setDescription("Otevře ticket systém"),

new SlashCommandBuilder()
.setName("server")
.setDescription("Informace o serveru"),

new SlashCommandBuilder()
.setName("pravidla")
.setDescription("Pravidla serveru"),

new SlashCommandBuilder()
.setName("help")
.setDescription("Seznam příkazů"),

new SlashCommandBuilder()
.setName("clear")
.setDescription("Smaže zprávy")
.addIntegerOption(opt =>
opt.setName("počet")
.setDescription("Počet zpráv")
.setRequired(true)
)

].map(cmd => cmd.toJSON());

await client.application.commands.set(commands);
});

/* =========================
SLASH COMMANDY
========================= */

client.on("interactionCreate", async interaction => {

if (interaction.isChatInputCommand()) {

// 🎫 TICKET PANEL
if (interaction.commandName === "ticketpanel") {

const embed = new EmbedBuilder()
.setTitle("🎫 TICKET SYSTÉM")
.setDescription("Vyber typ žádosti z menu níže.")
.setColor("Purple");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Vyber kategorii ticketu")

.addOptions([
{
label: "🛠️ Technická podpora",
description: "Problémy se serverem / Discordem",
value: "support"
},
{
label: "📝 Allowlist podpora",
description: "Pomoc s přijetím na server",
value: "allowlist"
},
{
label: "🚔 Žádost o frakci",
description: "Žádost o vytvoření RP frakce",
value: "faction"
},
{
label: "🚨 Nahlášení hráče",
description: "Report hráče za porušení pravidel",
value: "report"
},
{
label: "💬 Všeobecná pomoc",
description: "Obecné dotazy a informace",
value: "general_help"
}
]);

const row = new ActionRowBuilder().addComponents(menu);

interaction.reply({ embeds: [embed], components: [row] });
}


// 🌐 SERVER INFO
if (interaction.commandName === "server") {

interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🌐 SERVER INFO")
.setDescription(`
🚔 Realistické RP
📡 Dispatch systém
🎫 Ticket systém
📝 Allowlist
👮 Aktivní staff
`)
.setColor("Purple")
]
});
}


// 📜 PRAVIDLA
if (interaction.commandName === "pravidla") {

interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📜 PRAVIDLA")
.setDescription(`
❌ RDM / VDM
❌ Metagaming
❌ FailRP

✔ Serious RP
✔ FearRP
✔ Respect
`)
.setColor("Purple")
]
});
}


// 📚 HELP
if (interaction.commandName === "help") {

interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📚 PŘÍKAZY")
.setDescription(`
/ticketpanel
/server
/pravidla
/help
/clear
`)
.setColor("Purple")
]
});
}


// 🧹 CLEAR
if (interaction.commandName === "clear") {

if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
return interaction.reply({ content: "❌ Nemáš oprávnění", ephemeral: true });
}

const amount = interaction.options.getInteger("počet");
await interaction.channel.bulkDelete(amount);

interaction.reply({ content: `✔ Smazáno ${amount} zpráv`, ephemeral: true });
}

}

/* =========================
DROPDOWN MENU
========================= */

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "ticket_menu") {

const type = interaction.values[0];

const channel = await interaction.guild.channels.create({
name: `${type}-${interaction.user.username}`,
type: ChannelType.GuildText
});

let formText = "";

/* ===== FORMY ===== */

if (type === "support") {
formText = `
# 🛠️ TECHNICKÁ PODPORA

1. Typ problému
2. Popis problému
3. Kdy nastal
4. Screenshoty
`;
}

if (type === "allowlist") {
formText = `
# 📝 ALLOWLIST PODPORA

1. Discord jméno
2. Problém
3. Popis situace
4. Důkazy
`;
}

if (type === "faction") {
formText = `
# 🚔 ŽÁDOST O FRAKCI

1. Název frakce
2. Typ frakce
3. RP zkušenosti
4. Lore
5. Důvod založení
6. Členové
`;
}

if (type === "report") {
formText = `
# 🚨 NAHLÁŠENÍ HRÁČE

1. Jméno hráče
2. Porušení
3. Popis
4. Důkazy
`;
}

if (type === "general_help") {
formText = `
# 💬 VŠEOBECNÁ POMOC

1. Dotaz
2. Popis problému
3. Doplňující informace
`;
}

/* ===== EMBED ===== */

const embed = new EmbedBuilder()
.setTitle("📋 TICKET")
.setDescription(formText)
.setColor("Purple");

/* ===== BUTTONY ===== */

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
content: `${interaction.user}`,
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
BUTTONY
========================= */

if (interaction.isButton()) {

if (interaction.customId === "ticket_claim") {

interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("👮 Ticket převzat")
.setDescription(`${interaction.user} převzal ticket.`)
.setColor("Green")
]
});

}

if (interaction.customId === "ticket_close") {

await interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🔒 Ticket se zavírá")
.setDescription("Ticket bude uzavřen za 5 sekund.")
.setColor("Red")
]
});

setTimeout(() => {
interaction.channel.delete();
}, 5000);

}

}

});

client.login(TOKEN);
