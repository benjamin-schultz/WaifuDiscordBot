const fs = require("fs");
const FDConfig = require("./fdconfig.json");
const Request = require("request-promise");


const GameDisplayMap = new Map([['BBTag', displayBBTagFD], ['GGXRD-R2', displayGGFD]]);

async function framedata(message, args) {
    
    const gameName = args.shift().toLowerCase();

    try { 
        var game = checkGame(gameName); 
    } catch (err) {
        message.channel.send(err.message);
        return;
    }

    const charName = args.shift().toLowerCase();

    try {
        var char = await checkCharacter(charName, game, gameName);
    } catch (err) {
        message.channel.send(err.message);
        return;
    }
    
    const moveName = args.shift().toLowerCase();

    try {
        var ret = await loadMoveData(moveName, char, game);
        var fdMap = ret[0];
        var otherMoves = ret[1];
    } catch (err) {
        message.channel.send(err.message);
        return;
    }

    var fdString = GameDisplayMap.get(game.urlname)(char, fdMap);
    message.channel.send(fdString);
    if (otherMoves != null) {
        message.channel.send(otherMoves);
    }

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
        if (url.length != 3) {
            continue;
        }
        if (url[0] == game.urlname && url[2] == "Frame Data") {
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

function extractAllFD(json) {
    const fdMap = new Map();
    var text = json.parse.wikitext['*'];
    text = text.split('|');
    fdMap.clear();
    text.forEach(function(item) {
        if (item.indexOf("=") != -1) {
            extractFD(item, fdMap);
        }
    });

    return fdMap;
}

function extractFD(text, fdMap) {
    var index = text.search('=');
    var fdtype = text.substring(0, index).replace(/\r?\n|\r/g , "");
    var fd = text.substring(index+1, text.length).replace(/\r?\n|\r/g , "");
    fdMap.set(fdtype, fd);
}

async function loadMoveData(moveName, charName, game) {
    console.log(game);
    let uri = 'http://dustloop.com/wiki/api.php?action=parse&page=' + game.urlname + '/' + charName + '/Data' + '&format=json';
    let sectionuri = uri + '&prop=sections';

    var result = await Request(sectionuri);
    var jsonResult = JSON.parse(result);
    
    var section = jsonResult.parse.sections.filter(function(item) {
        return item.anchor.toLowerCase().includes(moveName) && item.anchor.includes('_Full');
    })

    var otherMoves = null;
    if (section.length > 1) {
        var moves = [];
        for (move in section) {
            moves.push(section[move].anchor.substring(0, section[move].anchor.length - 5));
        }
        otherMoves = "Other possible moves: " + moves.join(', ');
    } else if (section.length == 0) {
        var err = new Error("Cannot find move name!");
        throw err;
    }

    const index = section[0].index;
    let fduri = uri + '&section=' + index + '&prop=wikitext';
    var fdResult = await Request(fduri);
    var fdjson = JSON.parse(fdResult);
    var fdMap = extractAllFD(fdjson);
    fdMap.set('moveName', section[0].line.substring(0, section[0].line.length - 5));

    return [fdMap, otherMoves];
}


function displayBBTagFD(charName, fdMap) {
    var string = "```Game: BBTag | Character: " + charName + " | Move: " + fdMap.get('moveName') + 
    "\nStartup: " + fdMap.get('startup') + " | Active: " + fdMap.get('active') + " | Recovery: " + fdMap.get('recovery') +
    "\nFrame Adv.: " + fdMap.get('frameAdv') + " | Level: " + fdMap.get('level') + " | Guard: " + fdMap.get('guard') + 
    "\nProrate 1: " + fdMap.get('p1') + " | Prorate 2: " + fdMap.get('p2') +
    "\nInvul: " + fdMap.get('inv') + " | Damage: " + fdMap.get('damage') + " | Cancel: " + fdMap.get('cancel') +
    "```";

    return string;
}

function displayGGFD(charName, fdMap) {
    var string = "```Game: Guilty Gear | Character: " + charName + " | Move: " + fdMap.get('moveName') + 
    "\nStartup: " + fdMap.get('startup') + " | Active: " + fdMap.get('active') + " | Recovery: " + fdMap.get('recovery') +
    "\nFrame Adv.: " + fdMap.get('frameAdv') + " | Level: " + fdMap.get('level') + " | Guard: " + fdMap.get('guard') + 
    "\nTension: " + fdMap.get('tension') + " | RISC: " + fdMap.get('risc') + " | Prorate: " + fdMap.get('prorate') + 
    "\nInvul: " + fdMap.get('inv') + " | Damage: " + fdMap.get('damage') + " | Cancel: " + fdMap.get('cancel') +
    "```";
    return string;
}




module.exports = {
    framedata
}