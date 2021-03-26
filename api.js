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
    
    app.post('/api/checkusernameemail', async (req, res, next) => 
    {  
        // incoming: login, email  
        // outgoing: id, error  
        var error = '';  
        const { login, email } = req.body;  

        const db = client.db();  
        const results1 = await db.collection('Users').find({Login:login}).toArray();
        const results2 = await db.collection('Users').find({Email:email}).toArray();

        var id = 1;
        var ret;  
        
        if( results1.length > 0 || results2.length > 0)  
        {
            id = -1;
            error = "Username or Email already in use."
            ret = {id:id, error:error}
        }
        else 
        {
            ret = {id:id, error:error}
        }

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
        
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;

        for (let index = 0; index < meals.length; index++) 
        {
            if (meals[index].Calories > 0)
            {
                totalCal += meals[index].Calories;
            }
            if (meals[index].totalFat)
            {
                totalFat += meals[index].totalFat;
            }
            if (meals[index].sodium > 0)
            {
                totalSodium += meals[index].sodium;
            }
            if (meals[index].totalCarbs > 0)
            {
                totalCarbs += meals[index].totalCarbs;
            }
            if (meals[index].protein > 0)
            {
                totalProtein += meals[index].protein;
            }
        }

        var dat = Date.now();
        const newmealtime = {UserId:userId, Date: new Date(dat), totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein, Meals:meals};  
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
    
    app.post('/api/searchmealtime', async (req, res, next) => 
    {  
        // incoming: userId, range (of results wanted [7/30/365 etc]), jwtToken
        // outgoing: results[], error  
        var error = '';  
        const { userId, range, jwtToken } = req.body; 
        
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();
        var dat2 = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
        const results = await db.collection('Mealtime').find({"Date":{$gt: dat2}, "UserId":userId}).toArray();
        var _ret = [];
        for( var i=0; i<results.length; i++ )  
        {    
            _ret.push( {"Date":results[i].Date, "totalCalCount":results[i].totalCalCount, "totalFatCount":results[i].totalFatCount, "totalSodiumCount":results[i].totalSodiumCount, "totalCarbCount":results[i].totalCarbCount, "totalProteinCount":results[i].totalProteinCount, "mealtimeId":results[i]._id, "Meals":results[i].Meals});  
        }
        refreshedToken = jwt.refresh(jwtToken).accessToken;
        var ret = {results:_ret, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });
    
    app.post('/api/viewmealtime', async (req, res, next) =>
    {
        // incoming: mealtimeId, jwtToken
        // outgoing: mealtimeId (as id), totalCal, totalFat, totalSodium, totalCarbs, totalProtein, meals[], token, error
        
        var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var meals = [];
        
        const { mealtimeId, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const results = await db.collection('Mealtime').find({"_id":ObjectId(mealtimeId)}).toArray();   
        if( results.length > 0 )  
        {    
            id = results[0]._id;    
            totalCal = results[0].totalCalCount;
            totalFat = results[0].totalFatCount;
            totalSodium = results[0].totalSodiumCount;
            totalCarbs = results[0].totalCarbCount;
            totalProtein = results[0].totalProteinCount;
            meals = results[0].Meals;
        }
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, totalCal:totalCal, totalFat:totalFat, totalSodium:totalSodium, totalCarbs:totalCarbs, totalProtein:totalProtein, meals:meals, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });
}
