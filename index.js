import http from 'http';
import DiscordRPC from 'discord-rpc';
import maps from './maplist.json' assert { type: "json" };;

const PORT = 3000;
const AUTH = 'CCWJu64ZV3JHDT8hZc';


const teams = {
    'T': 'Terrorists',
    'CT': 'Counter-Terrorists'
}

const clientId = '1058733605364445255';
const RPC = new DiscordRPC.Client({ transport: 'ipc'});

let activity;
let timestamp;

// Run when connected to client
RPC.once('ready', async () => {
    console.log(`Discord-RPC has been enabled.\nConnected to ${RPC.user.username+"#"+RPC.user.discriminator}`); // Log that RPC is connected and to whom.
});

RPC.login({ clientId }).catch(err => console.error); // Connect to the client

const activities = {
    'menu': (body) => {
        return {
            state: "In Menu",
            details: "Main Menu",
            largeImageText: "Main Menu",
            largeImageKey: "menu",
            startTimestamp: body.timestamp
        }
    }
}

function updateRPC(body) {
    if (!RPC) return;
    console.log(body);
    body.timestamp = body.player.activity === activity ? timestamp : body.provider.timestamp;

    let newActivity = {
        largeImageKey: 'menu',
        details: "Main Menu",
        startTimestamp: body.timestamp
    };

    if (body.map) {
        newActivity.state = "[" + body.map.team_ct.score + " : " + body.map.team_t.score + "] " + body.map.phase;
        newActivity.details = body.map.mode.charAt(0).toUpperCase() + body.map.mode.slice(1) + " " + maps[body.map.name] || body.map.name;
        newActivity.largeImageKey = body.map.name;                              
        newActivity.largeImageText = body.map.name;
    }

    if (body.player && body.player.team) {
        newActivity.smallImageKey = body.player.team.toLowerCase();
        newActivity.smallImageText = teams[body.player.team];
    }

    RPC.setActivity(newActivity).catch(function(err) { // If something went wrong with setting the activity
        console.log("Unable to set activity.");
        console.log(err);
        return;
    });
    timestamp = body.timestamp;
    activity = body.player.activity;
}

function parseBody(req) {
    let body = '';
    req.on('data', function(chunk) {
        body = chunk
    });
    req.on('end', function () {
        body = JSON.parse(body);
        updateRPC(body);
    })
}


http.createServer((req, res)=>{

    // Only Allows METHOD POST
    if (req.method !== 'POST') {
        res.writeHead(405)
        res.write("Method Not Allowed");
        res.end();
        return;
    }

    // Check AUTH token
    /*if (!req.auth || req.auth.token !== AUTH) {
        res.writeHead(401);
        res.write("Unauthorized");
        res.end();
        return;
    }*/

    parseBody(req);
    // Sends a chunk of the response body
    res.write('Hello World!');
   
  res.end();
})
.listen(3000); // Server listening on port 3000