const Discord = require("discord.js");

const config = require("./config.json");
const lobby = require("./lobby-functions.js");
const misc = require("./misc-functions.js")

const bot = new Discord.Client();

bot.on("ready", () => {
    console.log('Waifu has started');
    bot.user.setActivity('Serving Okyakusama');
});

bot.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // Ignore all bots
    if (message.author.bot) return;

    // Ignore messages that don't start with prefix
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            misc.ping(message);
            break;

        case '8ball':
            misc.magicball(message,args);
            break;

        case 'register':
            lobby.register(message, args);
            break;
        
        case 'verify':
            lobby.verify(message);
            break;

        case 'lobby':
            lobby.lobby(message);
            break;
    }

});

bot.login(config.token);
