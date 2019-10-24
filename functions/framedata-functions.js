const FDConfig = require("./fdconfig.json");
const Request = require("request-promise");

async function framedata(message, args) {
    
    const gameName = args.shift().toLowerCase();

    try { 
        var game = checkGame(gameName); 
    } catch (err) {
        message.channel.send(err.message);
        return;
    }

    console.log(game);

    const charName = args.shift().toLowerCase();

    var char = checkCharacter(charName, game)
        .then( function () {
            break;
        })
        .catch( function (err) {
            message.channel.send(err.message);
            return;
        });

    console.log(char);
}

function checkGame(gameName) {
    var game = null;

    for (jsonGame in FDConfig.game) {
        if (jsonGame == gameName) {
            game = FDConfig.game[jsonGame];
            return game;
        }
    }

    if (game == null) {
        var err = new Error("Game name unrecognized");
        throw err;
    }

    return game;
}

async function checkCharacter(charName, game) {
    var char = null;

    for (jsonChar in game.characters) {
        if (jsonChar == charName) {
            
            char = game.characters[jsonChar];
            return char;
        }
    }

    let charURI = 'http://dustloop.com/wiki/api.php?action=parse&page=BlazBlue%20Cross%20Tag%20Battle&prop=links&format=json';
    var result = await Request(charURI);
    var jsonLinks = JSON.parse(result);
    chars = [];
    for (index in jsonLinks.parse.links) {
        var url = jsonLinks.parse.links[index]['*'];
        url = url.split('/');
        if (url.length > 2) {
            continue;
        }
        if (url[0] == game.urlname) {
            name = url[1].replace(/\s+/g, '');
            if (name.toLowerCase().includes(charName)) {
                chars.push(name);
            }
        }
    }

    if (chars.length > 1) {
        var err = new Error("Multiple possible characters, Did you mean?: " + chars.join(', '));
        throw err;
    } else if (chars.length == 1) {
        console.log(chars[0]);
        return chars[0];
    }

    if (char == null) {
        var err = new Error("Character name unrecognized");
        throw err;
    }

    return char;
}

module.exports = {
    framedata
}