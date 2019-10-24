const FDConfig = require("./fdconfig.json");

function framedata(message, args) {
    
    const gameName = args.shift().toLowerCase();

    try { 
        var game = checkGame(gameName); 
    } catch (err) {
        console.log(err);
        return;
    }

    console.log(game);
}

function checkGame(gameName) {
    var game = null;

    for (jsonGame in FDConfig.game) {
        if (jsonGame == gameName) {
            game = FDConfig.game[jsonGame];
            break;
        }
    }

    if (game == null) {
        var err = new Error("Game name unrecognized");
        throw err;
    }

    return game;
}

module.exports = {
    framedata
}