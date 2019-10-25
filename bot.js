const Discord = require("discord.js");

const Config = require("../config.json");
const Lobby = require("./functions/lobby-functions.js");
const Misc = require("./functions/misc-functions.js")
const FrameData = require("./functions/framedata-functions.js");

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
    if (message.content.indexOf(Config.prefix) !== 0) return;

    const args = message.content.slice(Config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            Misc.ping(message);
            break;

        case '8ball':
            Misc.magicball(message,args);
            break;

        case 'register':
            Lobby.register(message, args);
            break;
        
        case 'verify':
            Lobby.verify(message);
            break;

        case 'lobby':
            Lobby.lobby(message);
            break;
        
        case 'fd':
            FrameData.framedata(message, args);
            break;
    }

});

bot.login(Config.token);
