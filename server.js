const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(cors());
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;
const {ObjectId} = require('mongodb');
require('dotenv').config();
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
client.connect();
const jwt = require('./createJWT');
var api = require('./api.js');
api.setApp(app, client);

// For Heroku Deployment
if (process.env.NODE_ENV === 'production')
{
    // Set Static Folder
    app.use(express.static('frontend/build'));
    app.get('*', (req,res) =>
    {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

app.use((req, res, next) => 
{  
    res.setHeader('Access-Control-Allow-Origin', '*');  
    res.setHeader(    
        'Access-Control-Allow-Headers',    
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'  
    );  
    res.setHeader(    
        'Access-Control-Allow-Methods',    
        'GET, POST, PATCH, DELETE, OPTIONS'  
    );  
    next();
});


app.listen(PORT, () =>
{
    console.log('Server Listening on port' + PORT);
});