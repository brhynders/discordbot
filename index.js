//Load Dependencies
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

//Global Vars
var gameQueue = [];
var leaderboard = [];

//Helper Functions
const mention = (id) => {
    return `<@${id}>`;
}

const listPlayers = () => {
    if (gameQueue.length < 1) {
        return '**Nobody Yet**';
    }
    else {
        let out = '';
        gameQueue.forEach( (player) => {
            out += ` **${player.name}** -`
        });
    
        out = out.substring(0, out.length - 1);
        return out;
    }
}

const startMatch = (msg) => {
    msg.channel.send(`\`The queue is full and the match has started! Please check your DM for instructions on joining\``);
};

//Bot Functions
const handleAward = (msg, args) => {
    if (args.length !== 3) {
        msg.channel.send(`Incorrect number of parameters. Use !award [user] [points]`);
    }
    else {
        let user = args[1];
        let points = args[2];
        msg.channel.send(`${points} points have been awarded to ${user}`);
    }
};

const getHelp = (msg) => {
    msg.channel.send(`Use **!add** to add yourself to the match queue \nUse **!del** to remove youself from the match queue \nUse **!status** to get the status of the match queue`);
};

const getStatus = (msg) => {
    msg.channel.send(`The status of the queue is: **${gameQueue.length}** / **6** players \nThe current players queued are: ${listPlayers()}`);
};

function addTestPlayer(msg){
    let player = {
        name: 'TestPlayer',
        id: '1',
        captain: false
    };
    gameQueue.push(player);
    msg.channel.send(`Test Player has been added to the match queue.`);
    getStatus(msg);
    if(gameQueue.length == 6) {
        startMatch(msg);
    }
}

const showLeaderboard = (msg) => {
    msg.channel.send(`**Anna:** 1,000,000,000,000,000,000,000 \n**Everyone else:** 0`);
};

const addPlayer = (msg) => {
    let players = gameQueue.length;

    if (players < 6) {

        let isAlreadyAdded = false;
        gameQueue.forEach( (player) => {
            let quePlayer = player.id;
            let newPlayer = msg.author.id;
            if(quePlayer === newPlayer){
                isAlreadyAdded = true;
            }
        });

        if (isAlreadyAdded) {
            msg.channel.send(`You are already in the queue.`);
            getStatus(msg);
        }
        else {
            //Add the player
            let isCaptain;
            players == 0 ? isCaptain = true : isCaptain = false;
            let player = {
                name: msg.author.username,
                id: msg.author.id,
                captain: isCaptain
            }
            gameQueue.push(player);
            msg.channel.send(`${mention(msg.author.id)} has been added to the match queue.`);
            getStatus(msg);
            if(gameQueue.length == 6) {
                startMatch(msg);
            }
        }
    }
    else {
        msg.channel.send(`Sorry ${mention(msg.author.id)}, the game queue is full right now.`);
    }
};

const removePlayer = (msg) => {
    let newPlayer = msg.author.id;
    let isAdded = false;
    gameQueue.forEach( (player) => {
        if (player.id === newPlayer) {
            isAdded = true;
        }
    });

    if (isAdded) {
        gameQueue = gameQueue.filter(function(ob){ return(ob.id !== msg.author.id) });
        msg.channel.send("You've been removed from the match queue.");
        getStatus(msg);
    }
    else {
        msg.channel.send("You are not in the queue.");
        getStatus(msg);
    }
};


//Bot Events
client.on('message', msg => {

    if (msg.content.toLowerCase().startsWith('!award')){
        if (msg.member.roles.cache.some(role => role.name === 'League Staff')) {
            const args = msg.content.split(' ');
            handleAward(msg, args);
        }
        else {
            msg.channel.send("Only League Staff can use that command.");

        }
    }

    switch (msg.content.toLowerCase()) {
        case '!addtest':
            addTestPlayer(msg);
            break;
        case '!leaderboard':
            showLeaderboard(msg);
            break;
        case '!add':
            addPlayer(msg);
            break;
        case '!del':
            removePlayer(msg);
            break;
        case '!status':
            getStatus(msg);
            break;
        case '!help':
            getHelp(msg);
            break;
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("Ninja Competetive League");
});

//Start Bot
client.login(process.env.CLIENT_TOKEN);