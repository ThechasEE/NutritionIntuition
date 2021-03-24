require('express');
require('mongodb');
const {ObjectId} = require('mongodb');
const jwt = require('./createJWT');

exports.setApp = function (app, client)
{
app.post('/api/register', async (req, res, next) =>
    {
        // Incoming: login, email, password, firstName, lastName, calorieGoal, age, weight, goalWeight, height, gender 
        // Outgoing: id, error
        var error = '';
        var id = -1;  
        const { login, email, password, firstName, lastName, calorieGoal, age, weight, goalWeight, height, gender } = req.body;

        const db = client.db();  
        const resultsE = await db.collection('Users').find({Email:email}).toArray();
        const resultsU = await db.collection('Users').find({Login:login}).toArray();
        if (resultsE.length > 0 || resultsU.length > 0)
        {
            error = "Username or Email Already Exists";
            id = -1;
        }
        else
        {       
            const result = await db.collection('Users').insertOne({Login:login, Email:email, Password:password, FirstName:firstName, LastName:lastName, CalorieGoal:calorieGoal, Age:age, Weight:weight, GoalWeight:goalWeight, Height:height, Gender:gender});
            id = result.insertedId;
        }
        var ret = { id:id, error:error };
        res.status(200).json(ret);

    });

    app.post('/api/login', async (req, res, next) => 
    {  
        // incoming: login, password  
        // outgoing: jwt access token or id of -1 to signify user doesn't exist
        var error = '';  
        const { login, password } = req.body;  

        const db = client.db();  
        const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

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
    
    app.post('/api/viewprofile', async (req, res, next) =>
    {
        // incoming: userId and jwtToken
        // outgoing: firstName, lastName, age, weight, goalWeight, calorieGoal, height, gender, refreshedToken, error

        var error = '';
        var id = -1;
        var firstName = '';
        var lastName = '';
        var age = '';
        var weight = '';
        var goalWeight = '';
        var calorieGoal = '';
        var height = '';
        var gender = '';

        const { userId, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const results = await db.collection('Users').find({"_id":ObjectId(userId)}).toArray();   
        if( results.length > 0 )  
        {   
            firstName = results[0].FirstName;
            lastName = results[0].LastName;
            age = results[0].Age;
            weight = results[0].Weight;
            goalWeight = results[0].GoalWeight;
            calorieGoal = results[0].CalorieGoal;
            height = results[0].Height;
            gender = results[0].Gender;
        }
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { firstName:firstName, lastName:lastName, age:age, weight:weight, goalWeight:goalWeight, calorieGoal:calorieGoal, height:height, gender:gender, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });

    app.post('/api/updateprofile', async (req, res, next) =>
    {
        // incoming: userId, firstName, lastName, calorieGoal, age, weight, goalWeight, height, gender, jwtToken
        // outgoing: id, refreshedToken, error
        
        var error = '';
        var id = 0;

        const { firstName, lastName, calorieGoal, age, weight, goalWeight, height, gender, userId, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const results = await db.collection('Users').updateOne(
            {"_id":ObjectId(userId)},
            { $set: {"FirstName":firstName, 
                     "LastName":lastName,
                     "CalorieGoal":calorieGoal,
                     "Age":age,
                     "Weight":weight,
                     "GoalWeight":goalWeight,
                     "Height":height,
                     "Gender":gender}});

        if (results.matchedCount < 1)
        {
            error = "Update Failed";
            id = -1;
        }
        else
        {
            id = 1;
        }
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });
    
    app.post('/api/addmealtime', async (req, res, next) =>
    {  
        // incoming: userId, meals (array of json objects), jwtToken
        // outgoing: error  
        var id = -1;
        const { userId, meals, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
        var r = {id:id, error:'The JWT is no longer valid'};
        res.status(200).json(r);
        return;
        }

        var dat = Date.now();
        const newmealtime = {UserId:userId, Date: new Date(dat), Meals:meals};  
        var error = '';  

        const db = client.db();
        const check = await db.collection('Mealtime').find({"UserId":userId}).sort({$natural:-1}).limit(1).toArray();
        
        if (check.length > 0)
        {
            var datTest = check[0].Date.toDateString();
            var datToday = new Date(dat).toDateString();
            if (datTest === datToday)
            {
                error = "Mealtime already created today"
                id = -1;
            }
            else
            {
                try  
                {               
                    const result = await db.collection('Mealtime').insertOne(newmealtime);
                    id = result.insertedId;
                }  
                catch(e)  
                {    
                    error = e.toString();  
                }
            }
        }
        else
        {
            try  
            {               
                const result = await db.collection('Mealtime').insertOne(newmealtime);
                id = result.insertedId;
            }  
            catch(e)  
            {    
                error = e.toString();  
            }
        }

        //cardList.push( card );
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, token:refreshedToken, error:error };  
        res.status(200).json(ret);
    });
}
