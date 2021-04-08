require('express');
require('mongodb');
const {ObjectId} = require('mongodb');
const jwt = require('./createJWT');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.setApp = function (app, client)
{
app.post('/api/register', async (req, res, next) =>
    {
        // Incoming: login, email, password, firstName, lastName, calorieGoal, age, weight, goalWeight, height, gender 
        // Outgoing: id, error
        var error = '';
        var id = -1;
		var isVerified = false;
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
            const result = await db.collection('Users').insertOne({Login:login, Email:email, Password:password, FirstName:firstName, LastName:lastName, CalorieGoal:calorieGoal, Age:age, Weight:weight, GoalWeight:goalWeight, Height:height, Gender:gender, IsVerified:isVerified});
            id = result.insertedId;
			
			const msg = {
				to: email, // Change to your recipient
				from: 'noreply.nutritionintuition@gmail.com', // Change to your verified sender
				templateId: 'd-7ad16c4f998f4ffa8a4e407922a10f82',

				dynamic_template_data: {
					verify: 'https://nutrition-intuition.herokuapp.com/',
				},
			};

			sgMail
				.send(msg)
				.then(() => {
					console.log('Email sent')
				})
				.catch((error) => {
					console.error(error)
				});
			
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
            if(results[0].IsVerified == true) {
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
			else {
				error = "User is not verified."
				ret = {error:error}
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
    /*
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
	
	app.post('/api/addmeals', async (req, res, next) =>
    {  
        // incoming: mealtimeId, meals (array of json objects), jwtToken
        // outgoing: error  
        
		var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var mealsNew = [];
        
        const { mealtimeId, meals, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const find = await db.collection('Mealtime').find({"_id":ObjectId(mealtimeId)}).toArray();   
        if( find.length > 0 )  
        {    
            id = find[0]._id;    
            totalCal = find[0].totalCalCount;
            totalFat = find[0].totalFatCount;
            totalSodium = find[0].totalSodiumCount;
            totalCarbs = find[0].totalCarbCount;
            totalProtein = find[0].totalProteinCount;
            newMeals = find[0].Meals;
        }
		
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
		
		newMeals = newMeals.concat(meals);
		
		var query = { _id: id };
		var newvalues = { $set: {totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein, Meals:newMeals} };
		
		const result = await db.collection('Mealtime').updateOne(query, newvalues);
		
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });
	
	app.post('/api/removemeal', async (req, res, next) =>
    {  
        // incoming: mealtimeId, index (index of item to delete in meals array), jwtToken
        // outgoing: error  
        
		var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var meals = [];
        
        const { mealtimeId, index, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const find = await db.collection('Mealtime').find({"_id":ObjectId(mealtimeId)}).toArray();   
        if( find.length > 0 )  
        {    
            id = find[0]._id;    
            totalCal = find[0].totalCalCount;
            totalFat = find[0].totalFatCount;
            totalSodium = find[0].totalSodiumCount;
            totalCarbs = find[0].totalCarbCount;
            totalProtein = find[0].totalProteinCount;
            meals = find[0].Meals;
        }
		
		if (meals[index].Calories > 0)
		{
			totalCal -= meals[index].Calories;
		}
		if (meals[index].totalFat)
		{
			totalFat -= meals[index].totalFat;
		}
		if (meals[index].sodium > 0)
		{
			totalSodium -= meals[index].sodium;
		}
		if (meals[index].totalCarbs > 0)
		{
			totalCarbs -= meals[index].totalCarbs;
		}
		if (meals[index].protein > 0)
		{
			totalProtein -= meals[index].protein;
		}
		
		meals.splice(index, 1);
		
		var query = { _id: id };
		var newvalues = { $set: {totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein, Meals:meals} };
		
		const result = await db.collection('Mealtime').updateOne(query, newvalues);
		
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });
    */
	app.post('/api/addmeal', async (req, res, next) =>
    {  
        // incoming: userId, meal information, jwtToken
        // outgoing: error  
        var id = -1;
        const { userId, name, calories, servingSize, totalFat, sodium, totalCarbs, protein, jwtToken } = req.body;
        
        
        if( jwt.isExpired(jwtToken))
        {
        var r = {error:'The JWT is no longer valid'};
        res.status(200).json(r);
        return;
        }
        

        const newmeal = {UserId:userId, Name:name, Calories:calories, ServingSize:servingSize, TotalFat:totalFat, Sodium:sodium, TotalCarbs:totalCarbs, Protein:protein};
        var error = '';  

        const db = client.db();
        const check = await db.collection('Meals').find({"Name":name, "UserId":userId}).toArray();
        
        if (check.length > 0)
        {
            error = "A meal with this name already exists"
            id = check[0]._id;
        }
        else
        {
            try  
            {               
                const result = await db.collection('Meals').insertOne(newmeal);
                id = result.insertedId;
            }  
            catch(e)  
            {    
                error = e.toString();  
            }
        }

        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });

    app.post('/api/addmealtime', async (req, res, next) =>
    {  
        // incoming: userId, info (array of json objects, containing a mealId and amountConsumed), jwtToken
        // outgoing: error  
        var id = -1;
        const { userId, info, jwtToken } = req.body;

        var meals = [];

        for (let i = 0; i < info.length; i++)
        {
            meals.push(ObjectId(info[i].mealId))
        }
        
        if( jwt.isExpired(jwtToken))
        {
        var r = {error:'The JWT is no longer valid'};
        res.status(200).json(r);
        return;
        }
        

        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;

        const db = client.db();
        const ress = await db.collection('Meals').find({"UserId":userId, "_id": {$in : meals}}).toArray();
        var info1 = info;
        
        for (let index = 0; index < ress.length; index++) 
        {
            info1[index].name = ress[index].Name;

            if (ress[index].Calories > 0)
            {
                totalCal += (ress[index].Calories * info[index].amountConsumed);
            }
            if (ress[index].TotalFat > 0)
            {
                totalFat += (ress[index].TotalFat * info[index].amountConsumed);
            }
            if (ress[index].Sodium > 0)
            {
                totalSodium += (ress[index].Sodium * info[index].amountConsumed);
            }
            if (ress[index].TotalCarbs > 0)
            {
                totalCarbs += (ress[index].TotalCarbs * info[index].amountConsumed);
            }
            if (ress[index].Protein > 0)
            {
                totalProtein += (ress[index].Protein * info[index].amountConsumed);
            }
        }

        var dat = Date.now();
        var dat2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const newmealtime = {UserId:userId, Date: new Date(dat), totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein, Meals:info1};  
        var error = '';

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

        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, error: error, token:refreshedToken };  
        res.status(200).json(ret);
    });

    app.post('/api/viewmealtime', async (req, res, next) =>
    {
        var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var meals = [];
        var meals1 = [];
        
        
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

        for (let i = 0; i < meals.length; i++)
        {
            meals1.push(ObjectId(meals[i].mealId));
        }
        
        const ress = await db.collection('Meals').find({"_id": {$in : meals1}}).toArray();
        for (let i = 0; i < ress.length; i++)
        {
            ress[i].amountConsumed = meals[i].amountConsumed;
        }

        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, totalCal:totalCal, totalFat:totalFat, totalSodium:totalSodium, totalCarbs:totalCarbs, totalProtein:totalProtein, meals:ress, token:refreshedToken, error:error};  
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

    app.post('/api/addmeals', async (req, res, next) =>
    {  
        // incoming: mealtimeId, info (array of json objects), jwtToken
        // outgoing: error  
        
		var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var mealsNew = [];
        
        const { mealtimeId, info, jwtToken } = req.body;

        var meals = [];
        var mealscheck = [];

        for (let i = 0; i < info.length; i++)
        {
            mealscheck.push(info[i].mealId);
            meals.push(ObjectId(info[i].mealId));
        }
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const find = await db.collection('Mealtime').find({"_id":ObjectId(mealtimeId)}).toArray();   
        
        if( find.length > 0 ) 
        {    
            id = find[0]._id;    
            totalCal = find[0].totalCalCount;
            totalFat = find[0].totalFatCount;
            totalSodium = find[0].totalSodiumCount;
            totalCarbs = find[0].totalCarbCount;
            totalProtein = find[0].totalProteinCount;
            newMeals = find[0].Meals;
        }
        else
        {
            error = "Mealtime doesn't exist";
            refreshedToken1 = jwt.refresh(jwtToken);
            var ret1 = { error:error, token:refreshedToken1 };  
            res.status(200).json(ret1);
            return;
        }

        for (let index = 0; index < newMeals.length; index++)
        {
            if (mealscheck.includes(newMeals[index].mealId))
            {
                error = "Meal(s) exists in MealTime already"
                refreshedToken2 = jwt.refresh(jwtToken);
                var ret2 = { error:error, token:refreshedToken2 };  
                res.status(200).json(ret2);
                return;
            }
        } 

        const ress = await db.collection('Meals').find({"_id": {$in : meals}}).toArray();
        var info1 = info;
        
        for (let index = 0; index < ress.length; index++) 
        {
            info1[index].name = ress[index].Name;

            if (ress[index].Calories > 0)
            {
                totalCal += (ress[index].Calories * info[index].amountConsumed);
            }
            if (ress[index].TotalFat > 0)
            {
                totalFat += (ress[index].TotalFat * info[index].amountConsumed);
            }
            if (ress[index].Sodium > 0)
            {
                totalSodium += (ress[index].Sodium * info[index].amountConsumed);
            }
            if (ress[index].TotalCarbs > 0)
            {
                totalCarbs += (ress[index].TotalCarbs * info[index].amountConsumed);
            }
            if (ress[index].Protein > 0)
            {
                totalProtein += (ress[index].Protein * info[index].amountConsumed);
            }
        }
		
		newMeals = newMeals.concat(info);
		
		var query = { _id: id };
		var newvalues = { $set: {totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein, Meals:newMeals} };
		
		const result = await db.collection('Mealtime').updateOne(query, newvalues);
		
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });

    app.post('/api/removemealtimemeal', async (req, res, next) =>
    {  
        // incoming: mealtimeId, mealId, jwtToken
        // outgoing: error  
        
		var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var meals = [];
        var meals1 = [];
        var index = -1;
        
        const { mealtimeId, mealId, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const find = await db.collection('Mealtime').find({"_id":ObjectId(mealtimeId)}).toArray();   
        if( find.length > 0 )  
        {    
            id = find[0]._id;    
            totalCal = find[0].totalCalCount;
            totalFat = find[0].totalFatCount;
            totalSodium = find[0].totalSodiumCount;
            totalCarbs = find[0].totalCarbCount;
            totalProtein = find[0].totalProteinCount;
            meals = find[0].Meals;
        }

        for (let i = 0; i < meals.length; i++)
        {
            meals1.push(ObjectId(meals[i].mealId));

            if (meals[i].mealId === mealId)
            {
                index = i;
            }
        }

        if (index == -1)
        {
            error = "Meal not found in MealTime"
            refreshedToken1 = jwt.refresh(jwtToken);
            var ret1 = { error:error, token:refreshedToken1 };  
            res.status(200).json(ret1);
            return;
        }

        const ress = await db.collection('Meals').find({"_id": {$in : meals1}}).toArray();
		
		if (ress[index].Calories > 0)
		{
			totalCal -= (ress[index].Calories * meals[index].amountConsumed);
		}
		if (ress[index].TotalFat)
		{
			totalFat -= (ress[index].TotalFat * meals[index].amountConsumed);
		}
		if (ress[index].Sodium > 0)
		{
			totalSodium -= (ress[index].Sodium * meals[index].amountConsumed);
		}
		if (ress[index].TotalCarbs > 0)
		{
			totalCarbs -= (ress[index].TotalCarbs * meals[index].amountConsumed);
		}
		if (ress[index].Protein > 0)
		{
			totalProtein -= (ress[index].Protein * meals[index].amountConsumed);
		}
		
		meals.splice(index, 1);
		
		var query = { _id: id };
		var newvalues = { $set: {totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein, Meals:meals} };
		
		const result = await db.collection('Mealtime').updateOne(query, newvalues);
		
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });
	
	app.post('/api/viewmeal', async (req, res, next) =>
    {
        var error = '';
        var id = -1;
        var Name = "";
        var ServingSize = "";
        var Cal = 0;
        var Fat = 0;
        var Sodium = 0;
        var Carbs = 0;
        var Protein = 0;        
        
        // In: mealId and jwtToken
        // Out: id, Name, ServingSize, Fat, Sodium, Carbs, Calories, Protein, token, error
        const { mealId, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const results = await db.collection('Meals').find({"_id":ObjectId(mealId)}).toArray();   
        if( results.length > 0 )  
        {    
            id = results[0]._id;
            Name = results[0].Name;
            ServingSize = results[0].ServingSize;
            Cal = results[0].Calories;
            Fat = results[0].Fat;
            Sodium = results[0].Sodium;
            Carbs = results[0].TotalCarbs;
            Protein = results[0].Protein;
        }

        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, Name:Name, ServingSize:ServingSize, Calories:Cal, Fat:Fat, Sodium:Sodium, Carbs:Carbs, Protein:Protein, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });

    app.post('/api/editmeal', async (req, res, next) =>
    {  
        // incoming: UserId, mealId, all the meal info, jwtToken
        // outgoing: error, token  
        
		var error = '';
        var id = -1;
        
        const { userId, mealId, name, calories, servingSize, totalFat, sodium, totalCarbs, protein, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();
        const find1 = await db.collection('Meals').find({"UserId":userId, "Name":name}).toArray();
        if (find1.length > 0)
        {
            if (find1[0]._id != mealId)
            {
                error = "Meal with this name already exists, choose another."
                id = -1;
                refreshedToken2 = jwt.refresh(jwtToken);
                var ret2 = { id:id, error:error, token:refreshedToken2 }; 
                res.status(200).json(ret2);
                return;
            }
            
        }  
	    
        const find = await db.collection('Meals').find({"_id":ObjectId(mealId)}).toArray();   
        if( find.length <= 0 )  
        {    
            error = "Meal does not exist";
		id = -1;
            refreshedToken1 = jwt.refresh(jwtToken);
            var ret1 = { id:id, error:error, token:refreshedToken1 };    
            res.status(200).json(ret1);
            return;
        }
		
        //const newmeal = {UserId:userId, Name:name, Calories:calories, ServingSize:servingSize, TotalFat:totalFat, Sodium:sodium, TotalCarbs:totalCarbs, Protein:protein};

		var query = { _id: ObjectId(mealId) };
		var newvalues = { $set: {Name:name, Calories:calories, ServingSize:servingSize, TotalFat:totalFat, Sodium:sodium, TotalCarbs:totalCarbs, Protein:protein} };
		
		const result = await db.collection('Meals').updateOne(query, newvalues);
		
        refreshedToken = jwt.refresh(jwtToken);
        var ret = { id:id, error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });

    app.post('/api/editamountconsumed', async (req, res, next) =>
    {  
        // incoming: mealtimeId, mealId, newAmount (new amountConsumed value), jwtToken
        // outgoing: error, token 
        
		var error = '';
        var id = -1;
        var totalCal = 0;
        var totalFat = 0;
        var totalSodium = 0;
        var totalCarbs = 0;
        var totalProtein = 0;
        var index = -1;
        var oldamount = 0;
        var meals = [];
        var meals1 = [];
        
        const { mealtimeId, mealId, newAmount, jwtToken } = req.body;
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const find = await db.collection('Mealtime').find({"_id":ObjectId(mealtimeId)}).toArray();   
        if( find.length <= 0 )  
        {    
            error = "Mealtime does not exist";
            refreshedToken1 = jwt.refresh(jwtToken);
            var ret1 = { error:error, token:refreshedToken1 };  
            res.status(200).json(ret1);
            return;
        }

        var totalCal = find[0].totalCalCount;
        var totalFat = find[0].totalFatCount;
        var totalSodium = find[0].totalSodiumCount;
        var totalCarbs = find[0].totalCarbCount;
        var totalProtein = find[0].totalProteinCount;

        for (let i = 0; i < find[0].Meals.length; i++)
        {
            if (find[0].Meals[i].mealId === mealId)
            {
                oldamount = find[0].Meals[i].amountConsumed;
                index = i;
            }
        }

        const find2 = await db.collection('Meals').find({"_id":ObjectId(mealId)}).toArray();
		
        if (find2[0].Calories > 0)
		{
			totalCal -= (find2[0].Calories * oldamount);
            totalCal += (find2[0].Calories * newAmount);
		}
		if (find2[0].TotalFat)
		{
			totalFat -= (find2[0].TotalFat * oldamount);
            totalFat += (find2[0].TotalFat * newAmount);
		}
		if (find2[0].Sodium > 0)
		{
			totalSodium -= (find2[0].Sodium * oldamount);
            totalSodium += (find2[0].Sodium * newAmount);
		}
		if (find2[0].TotalCarbs > 0)
		{
			totalCarbs -= (find2[0].TotalCarbs * oldamount);
            totalCarbs += (find2[0].TotalCarbs * newAmount);
		}
		if (find2[0].Protein > 0)
		{
			totalProtein -= (find2[0].Protein * oldamount);
            totalProtein += (find2[0].Protein * newAmount);
		}

		var query = { _id: ObjectId(mealtimeId) };
		var newvalues = { $set: {totalCalCount:totalCal, totalFatCount:totalFat, totalSodiumCount:totalSodium, totalCarbCount:totalCarbs, totalProteinCount:totalProtein} };
		
		const result = await db.collection('Mealtime').updateOne(query, newvalues);

        var query1 = { _id: ObjectId(mealtimeId), "Meals.mealId":mealId};
        var newvals = { $set: {"Meals.$.amountConsumed":newAmount}};
        
        const result1 = await db.collection('Mealtime').updateOne(query1, newvals);

        refreshedToken = jwt.refresh(jwtToken);
        var ret = { error:error, token:refreshedToken };  
        res.status(200).json(ret);
    });

    app.post('/api/searchmealname', async (req, res, next) => 
    {  
        // incoming: userId, search (food name), jwtToken
        // outgoing: results[], error, token  
        var error = '';  
        const { userId, search, jwtToken } = req.body; 
        
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        var _search = search.trim(); 
        const db = client.db();  
        const results = await db.collection('Meals').find({"Name":{$regex:_search+'.*', $options:'r'}, "UserId":userId}).toArray();

        var _ret = [];

        for( var i=0; i<results.length; i++ )  
        {    
            _ret.push( {"Name":results[i].Name, "Calories":results[i].Calories, "mealId":results[i]._id});  
        }

        refreshedToken = jwt.refresh(jwtToken).accessToken;
        var ret = {results:_ret, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });

    app.post('/api/searchmealuser', async (req, res, next) => 
    {  
        // incoming: userId, jwtToken
        // outgoing: results[], error  
        var error = '';  
        const { userId, jwtToken } = req.body; 
        
        
        if( jwt.isExpired(jwtToken))
        {
            var r = {error:'The JWT is no longer valid'};
            res.status(200).json(r);
            return;
        }

        const db = client.db();  
        const results = await db.collection('Meals').find({"UserId":userId}).toArray();

        var _ret = [];

        for( var i=0; i<results.length; i++ )  
        {    
            _ret.push( {"Name":results[i].Name, "Calories":results[i].Calories, "mealId":results[i]._id});  
        }

        refreshedToken = jwt.refresh(jwtToken).accessToken;
        var ret = {results:_ret, token:refreshedToken, error:error};  
        res.status(200).json(ret);
    });
	
	app.post('/api/emailpasswordreset', async (req, res, next) =>
    {
        // Incoming: email 
        // Outgoing: error
        var error = '';
        const { email } = req.body;
			
		const msg = {
			to: email, // Change to your recipient
			from: 'noreply.nutritionintuition@gmail.com', // Change to your verified sender
			templateId: 'd-290d6278dd4949fe8f7aed021177cf4d',

			dynamic_template_data: {
				verify: 'https://nutrition-intuition.herokuapp.com/',
			},
		};

		sgMail
			.send(msg)
			.then(() => {
				console.log('Email sent')
			})
			.catch((error) => {
				console.error(error)
			});
		
        var ret = { error:error };
        res.status(200).json(ret);

    });
	
	app.post('/api/verify', async (req, res, next) =>
    {
        // Incoming: userId
        // Outgoing: error
        var error = '';
		var isVerified = true;
        const { userId } = req.body;
		
		const db = client.db();  
        const results = await db.collection('Users').updateOne(
            {"_id":ObjectId(userId)},
            { $set: {"IsVerified":isVerified}});

        if (results.matchedCount < 1)
        {
            error = "Update Failed";
        }
		
        var ret = { error:error };
        res.status(200).json(ret);

    });
	
	app.post('/api/resendemail', async (req, res, next) =>
    {
        // Incoming: login, email, password, firstName, lastName, calorieGoal, age, weight, goalWeight, height, gender 
        // Outgoing: error
        var error = '';
        const { email } = req.body;
			
		const msg = {
			to: email, // Change to your recipient
			from: 'noreply.nutritionintuition@gmail.com', // Change to your verified sender
			templateId: 'd-7ad16c4f998f4ffa8a4e407922a10f82',

			dynamic_template_data: {
				verify: 'https://nutrition-intuition.herokuapp.com/',
			},
		};

		sgMail
			.send(msg)
			.then(() => {
				console.log('Email sent')
			})
			.catch((error) => {
				console.error(error)
			});
		
        var ret = { error:error };
        res.status(200).json(ret);

    });
}
