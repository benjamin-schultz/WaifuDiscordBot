const fs = require("fs");
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

    try {
        var char = await checkCharacter(charName, game, gameName);
    } catch (err) {
        message.channel.send(err.message);
        return;
    }

    console.log(char);

    message.channel.send("Character is " + char + "! :D");

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

async function checkCharacter(charName, game, gameName) {
    var char = null;

    for (jsonChar in game.characters) {
        if (jsonChar == charName) {
            
            char = game.characters[jsonChar];
            return char;
        }
    }

    let charURI = 'http://dustloop.com/wiki/api.php?action=parse&page=' + FDConfig.game[gameName].charpage + '&prop=links&format=json';
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
            name = url[1].replace(/\s+/g, '_');
            if (name.toLowerCase().includes(charName)) {
                chars.push(name);
            }
        }
    }

    if (chars.length > 1) {
        var err = new Error("Multiple possible characters, Did you mean?: " + chars.join(', '));
        throw err;
    } else if (chars.length == 1) {
        FDConfig.game[gameName].characters[charName] = chars[0];
        
        fs.writeFile("./functions/fdconfig.json", JSON.stringify(FDConfig, null, 2), "utf8", function (err) {
            if (err) return console.log(err);
            console.log(JSON.stringify(FDConfig));
        });      

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