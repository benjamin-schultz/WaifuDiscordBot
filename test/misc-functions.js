const Request = require("request");

async function ping(message) {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
}

function magicball(message, args) {
    const params = args.join(" ");
    const url = 'https://8ball.delegator.com/magic/JSON/' + params;
    Request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const m = JSON.parse(body);
            message.channel.send(m.magic.answer + "!");
        }
    })
} 

module.exports = {
    ping,
    magicball
}