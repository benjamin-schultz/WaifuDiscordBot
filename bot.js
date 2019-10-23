var fetch = require('isomorphic-fetch');
var Discord = require('discord.io');
var auth = require('./auth.json');
var fs = require("fs");
var STEAM_API_KEY = '5F2AF5B088F305BA1E442ED2899A5C63';
var SteamApi = require('steamapi');
var Steam = new SteamApi(STEAM_API_KEY);
var SteamWebApi = require('steamwebapi');
SteamWebApi.setAPIKey(STEAM_API_KEY);

var userMap = require('./users.json');
console.log(userMap);

// Init
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', function (evt) {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt){
    //Our bot needs to know if it will execute a command
    //it will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            //!ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;

            case 'register':
                
                Steam.resolve('https://steamcommunity.com/id/' + args[0]).then(id => {
                    userMap[userID] = id;

                    fs.writeFile("users.json", JSON.stringify(userMap), "utf8", console.log);

                    bot.sendMessage({
                        to: channelID,
                        message: user + ' added SteamID ' + args[0] + '. You can now use !lobby function! :D '
                    });

                }).catch(function(e) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'User ' + user + ' provided an incorrect SteamID. Ensure it is the value at the end of your steamurl, not your nickname.'
                    });
                });
                
                
                break;

            case 'verify':
                if (userID in userMap) {
                    bot.sendMessage({
                        to: channelID,
                        message: user + ' can use !lobby function! :D '
                    });
                } else {
                    bot.sendMessage({
                        to: channelID,
                        message: 'User ' + user + ' is not found in database! use !register [Steam ID] to use it!'
                    })
                }
                
                break;
            
            case 'lobby':
                if (userID in userMap) {
                    SteamWebApi.getPlayerSummaries(userMap[userID], function(res) {
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
                                bot.sendMessage({
                                    to: channelID,
                                    message: lobbylink
                                });

                            } else {
                                bot.sendMessage({
                                    to: channelID,
                                    message: 'Error trying to create lobby! Do you have a lobby open, profile public, and your steam id registered?'
                                })
                            }          
                        }
                    });
                } else {
                    bot.sendMessage({
                        to: channelID,
                        message: 'User ' + user + ' is not registered for this function. Type !register [Steam ID] to use this function.'
                    });
                }
                break;

            case '8ball':
                let params = encodeURIComponent(args[0]);
                let uri = 'https://8ball.delegator.com/magic/JSON/' + params;

                fetch(uri)
                    .then((response) => { return response.json() })
                    .then((json) => {
                        bot.sendMessage({
                            to: channelID,
                            message: json.magic.answer + '!'
                        })
                    });
                break;
            
            case 'fd':
                framedata(args, bot, channelID);
                break;
        }
    }
});

const fdMap = new Map();

function framedata(args, bot, channelID) {

    const GameDisplayMap = new Map([['BBTag', displayBBTagFD], ['GGXRD-R2', displayGGFD]]);

    function extractAllFD(json) {
        var text = json.parse.wikitext['*'];
        text = text.split('|');
        fdMap.clear();
        text.forEach(function(item) {
            if (item.indexOf("=") != -1) {
                extractFD(item);
            }
        });
    }

    function extractFD(text) {
        var index = text.search('=');
        var fdtype = text.substring(0, index).replace(/\r?\n|\r/g , "");
        var fd = text.substring(index+1, text.length).replace(/\r?\n|\r/g , "");
        fdMap.set(fdtype, fd);
    }

    function displayBBTagFD() {
        var string = "```Game: BBTag | Character: " + character + " | Move: " + moveName + 
        "\nStartup: " + fdMap.get('startup') + " | Active: " + fdMap.get('active') + " | Recovery: " + fdMap.get('recovery') +
        "\nFrame Adv.: " + fdMap.get('frameAdv') + " | Level: " + fdMap.get('level') + " | Guard: " + fdMap.get('guard') + 
        "\nProrate 1: " + fdMap.get('p1') + " | Prorate 2: " + fdMap.get('p2') +
        "\nInvul: " + fdMap.get('inv') + " | Damage: " + fdMap.get('damage') + " | Cancel: " + fdMap.get('cancel') +
        "```";
        
        return string;
    }

    function displayGGFD() {
        var string = "```Game: Guilty Gear | Character: " + character + " | Move: " + moveName + 
        "\nStartup: " + fdMap.get('startup') + " | Active: " + fdMap.get('active') + " | Recovery: " + fdMap.get('recovery') +
        "\nFrame Adv.: " + fdMap.get('frameAdv') + " | Level: " + fdMap.get('level') + " | Guard: " + fdMap.get('guard') + 
        "\nTension: " + fdMap.get('tension') + " | RISC: " + fdMap.get('risc') + " | Prorate: " + fdMap.get('prorate') + 
        "\nInvul: " + fdMap.get('inv') + " | Damage: " + fdMap.get('damage') + " | Cancel: " + fdMap.get('cancel') +
        "```";
        return string;
    }

    var game = args[0];
    if (game.toLowerCase() == 'ggxrd') {
        game = "GGXRD-R2";
    }
    var character = args[1];
    var move = args[2];
    var moveName = args[2];
    var move = move + '_Full';

    let uri = 'http://dustloop.com/wiki/api.php?action=parse&page=' + game + '/' + character + '/Data' + '&format=json';
    let sectionuri = uri + '&prop=sections';

    fetch(sectionuri)
        .then((response) => { return response.json() })
        .then((json) => {
            var sectionFound = json.parse.sections.filter(function(item) {
                return item.anchor == move;
            })
            var section = sectionFound[0].index;
            let fdjson = uri + '&section=' + section + '&prop=wikitext';
            fetch(fdjson)
                .then((response) => { return response.json() })
                .then((json) => {
                    extractAllFD(json);
                    var string = GameDisplayMap.get(game)();
                    bot.sendMessage({
                        to: channelID,
                        message: string
                    });
                });
        });
}