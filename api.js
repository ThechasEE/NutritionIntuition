require('express');
require('mongodb');
const {ObjectId} = require('mongodb');
const jwt = require('./createJWT');

exports.setApp = function (app, client)
{
    app.post('/api/register', async (req, res, next) =>
    {
        // Incoming: login, password, firstname, lastname, email (Maybe: Weight / Goal Weight)
        // Outgoing: id, error
        var error = '';
        var id = -1;  
        const { email, password, firstName, lastName } = req.body;

        const db = client.db();  
        const results = await db.collection('Users').find({Email:email}).toArray(); 
        if (results.length > 0)
        {
            error = "User Already Exists";
            id = -1;
        }
        else
        {       
            const result = await db.collection('Users').insertOne({Email:email, Password:password, FirstName:firstName, LastName:lastName});
            id = result.insertedId;
        }
        var ret = { id:id, error:error };
        res.status(200).json(ret);

    });

    app.post('/api/login', async (req, res, next) => 
    {  
        // incoming: login, password  
        // outgoing: id, firstName, lastName, error  
        var error = '';  
        const { email, password } = req.body;  

        const db = client.db();  
        const results = await db.collection('Users').find({Email:email,Password:password}).toArray();

        var id = -1;  
        var fn = '';  
        var ln = '';
        var ret;  
        
        if( results.length > 0 )  
        {    
            id = results[0]._id;    
            fn = results[0].FirstName;
            ln = results[0].LastName;
            
            try 
            {
                ret = jwt.createToken(fn, ln, id); 
            } 
            catch (e) 
            {
                ret = {error:e.message};
            }
        }
        else 
        {
            ret = {id:id}
        }
        //var ret = { id:id, firstName:fn, lastName:ln, error:error};  
        res.status(200).json(ret);
    });
}