const fs = require("fs");
const SteamApi = require("steamapi");
const SteamWebApi = require('steamwebapi');

const config = require("../../config.json");
const Steam = new SteamApi(config.steamkey);
const users = require("./users.json");

SteamWebApi.setAPIKey(config.steamkey);

function register(message, args) {
                    
    Steam.resolve('https://steamcommunity.com/id/' + args[0]).then(id => {
        key = message.author.id;
        users[key] = args[0];

        fs.writeFile("users.json", JSON.stringify(users), "utf8", function (err) {
            if (err) return console.log(err);
            console.log(JSON.stringify(users));
        });

        message.channel.send(message.author + ' added SteamID ' + args[0] + '. You can now use !lobby function! :D ');

    }).catch(function(e) {
        message.channel.send('User ' + message.author + ' provided an incorrect SteamID. Ensure it is the value at the end of your steamurl, not your nickname.');
    });
    
}

function verify(message) {
    key = message.author.id;
    if (users[key]) {
        message.channel.send(message.author + ' can use !lobby function :D');
    } else {
        message.channel.send(message.author + ' cannot use !lobby function :(');
    }
}

function lobby(message) {
    key = message.author.id;
    if (users[key]) {
        SteamWebApi.getPlayerSummaries(users[key], function(res) {
            if (typeof res.error !== 'undefined') {
                console.log(res.error);
            } else {
                if (res.response.players[0].gameid !== undefined && res.response.players[0].lobbysteamid !== undefined) {
                    console.log(res.response);
                    var gameid = res.response.players[0].gameid;
                    console.log(gameid);
                    var lobbyid = res.response.players[0].lobbysteamid;
                    var playerid = res.response.players[0].steamid;

                    var lobbylink = "steam://joinlobby/" + gameid + "/" + lobbyid + "/" + playerid;
                    message.channel.send(lobbylink);
                } else {
                    message.channel.send('Error trying to create lobby! Do you have a lobby open, profile public, and your steam id registered?');
                }          
            }
        });
    } else {
        message.channel.send(message.author + ' is not registered for this function. Type !register [Steam ID] to use this function.');
    }
}

module.exports = {
    register,
    verify,
    lobby
};