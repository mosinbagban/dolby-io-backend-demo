const http = require('http');
var express = require('express');
const https = require("https");
const dotenv = require('dotenv').config();
var cors = require('cors');



const port = process.env.PORT || 3000

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/html');
//   res.end('<h1>Hello World</h1> ');
//   console.log('Consumer Key' + process.env.CONSUMER_KEY)
// });

var app = express();


app.use(cors({origin: '*'}));

// Parse POST requests as JSON payload
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

  // simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to DolbyIo App builder REST application." });
  });

  require("./routes/appbuilder.routes")(app);

  require("./routes/turorial.routes")(app);

// Serve static files
app.use(express.static('public'))
console.log("Port: " + port)
const CONSUMER_KEY = process.env.CONSUMER_KEY ?? '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET ?? '';

// if (CONSUMER_KEY.length <= 0 || CONSUMER_SECRET.length <= 0) {
//     throw new Error('The Consumer Key and/or Secret are missing!');
// }

/**
 * Sends a POST request
 * @param {string} hostname
 * @param {string} path 
 * @param {*} headers 
 * @param {string} body 
 * @returns A JSON payload object through a Promise.
 */
const postAsync = (hostname, path, headers, body) => {
    return new Promise(function(resolve, reject) {
        const options = {
            hostname: hostname,
            port: 443,
            path: path,
            method: 'POST',
            headers: headers
        };
        
        const req = https.request(options, res => {
            console.log(`[POST] ${res.statusCode} - https://${hostname}${path}`);

            let data = '';
            res.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            res.on('end', () => {
                const json = JSON.parse(data);
                resolve(json);
            })
        });
        
        req.on('error', error => {
            console.error('error', error);
            reject(error);
        });
        
        req.write(body);
        req.end();
    });
};

/**
 * Gets a JWT token for authorization.
 * @param {string} hostname 
 * @param {string} path 
 * @returns a JWT token.
 */
const getAccessTokenAsync = (hostname, path) => {
    const body = "grant_type=client_credentials";

    const authz = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    console.log('ConsumerKey: ' + CONSUMER_KEY);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin':'*',
        'Cache-Control': 'no-cache',
        'Authorization': 'Basic ' + authz,
        'Content-Length': body.length
    };

    return postAsync(hostname, path, headers, body);
}

// See: https://docs.dolby.io/interactivity/reference/authentication#postoauthtoken-1
const getClientAccessTokenAsync = () => {
    console.log('Get Client Access Token');
    return getAccessTokenAsync('session.voxeet.com', '/v1/oauth2/token');
}

// See: https://docs.dolby.io/interactivity/reference/authentication#jwt
const getAPIAccessTokenAsync = () => {
    console.log('Get API Access Token');
    return getAccessTokenAsync('api.voxeet.com', '/v1/auth/token');
}

// See: https://docs.dolby.io/interactivity/reference/conference#postconferencecreate
const createConferenceAsync = async (alias, ownerExternalId) => {
    const body = JSON.stringify({
        alias: alias,
        parameters: {
            dolbyVoice: true,
            liveRecording: false,
            ttl:600
        },
        ownerExternalId: ownerExternalId
    });
    
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Authorization': 'Bearer ' + jwt.access_token,
        'Content-Length': body.length
    };

    return await postAsync('api.voxeet.com', '/v2/conferences/create', headers, body);
};

// See: https://docs.dolby.io/interactivity/reference/conference#postconferenceinvite
const getInvitationAsync = async (conferenceId, externalId) => {
    const participants = {};
    participants[externalId] = {
        permissions: [
            "INVITE",
            "JOIN",
            "SEND_AUDIO",
            "SEND_VIDEO",
            "SHARE_SCREEN",
            "SHARE_VIDEO",
            "SHARE_FILE",
            "SEND_MESSAGE",
            //"RECORD",
            //"STREAM",
            //"KICK",
            //"UPDATE_PERMISSIONS"
        ]
    };


    const body = JSON.stringify({
        participants: participants
    });
    
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Authorization': 'Bearer ' + jwt.access_token,
        'Content-Length': body.length
    };

    return await postAsync('api.voxeet.com', `/v2/conferences/${conferenceId}/invite`, headers, body);
};


app.get('/access-token', function (request, response) {
    console.log(`[GET] ${request.url}`);

    getClientAccessTokenAsync()
        .then(accessToken => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(accessToken));
        })
        .catch(() => {
            response.status(500);
        });
});

app.post('/conference', function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const alias = request.body.alias;
    const ownerExternalId = request.body.ownerExternalId;

    createConferenceAsync(alias, ownerExternalId)
        .then(conference => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(conference));
        })
        .catch(() => {
            response.status(500);
        });
});

app.post('/get-invited', function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const conferenceId = request.body.conferenceId; //'1e8d15ba-3265-4dc4-9353-98c14a7dc54c';
    const externalId = request.body.externalId;

    getInvitationAsync(conferenceId, externalId)
        .then(accessToken => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify({accessToken: accessToken[externalId]}));
            console.log(JSON.stringify({accessToken: accessToken[externalId]}))
        })
        .catch(() => {
            response.status(500);
        });
});


// server.listen(port,() => {
//   console.log(`Server running at port `+port);
// });

var server2 = app.listen(port, function () {
  var host = server2.address().address;
  var port = server2.address().port;
  console.log("Dolby.io sample app listening at http://%s:%s", host, port);
});