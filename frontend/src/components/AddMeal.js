import React, {useEffect, useState} from "react";
import {useHistory, useParams} from 'react-router-dom';
import bp from "./bp";
import {Link} from "react-router-dom";
import FetchData from "./fetchComponent";
import addMealDay from "./addMealDay";
import Navbar from "./navbar";
import SearchResults from "./DisplaySearchResults";

class Variables extends React.Component
{
    static mealStuff = {
        mealId: "",
        mealtimeId: "",
        searchedMeals: []
    }
}


const CreateMeal = () => {
    //token
    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    //console.log(userId);
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;
    /* end token */

    //define values for meal; setters and getters
    const [name, setName] = useState('');
    const [searchName, setSearchName] = useState('');
    const [resultsGotten, setResultsGotten] = useState(false);
    //const [userId, setUserId] = useState(userId);
    const [calories, setCalories] = useState('');
    const [servingSize, setServingSize] = useState('');
    const [totalFat, setTotalFat] = useState('');
    const [sodium, setSodium] = useState('');
    const [totalCarbs, setTotalCarbs] = useState('');
    const [protein, setProtein] = useState('');
    const [failedToAdd, setFailedToAdd] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error,setError] = useState(null);

    //variables
    const [mealId, setMealId] = useState('');
    //let mealId2;
    //let mealtimeId2;
    //let mealtimeToken2;
    //const [mealtimeId, setmealtimeId] = useState('');
    const [amountConsumed, setamountConsumed] = useState('');
    const [meal, setMeal] = useState('');
    const [mealsArray, setMealsArray] = useState('');
    const [searchedMealName, setSearchedMealName] = useState('');
    const [mealtimeToken, setMealtimeToken] = useState('');
    const history = useHistory();
    const [todayMealExists, setTodayMealExists] = useState(false);

    const checkIfMealExistsToday = () => {
        //collect data for components
        var obj = {
            userId: userId,
            jwtToken: tok
        }

        setIsPending(true);

        fetch(bp.buildPath("api/mealtimecheck"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(obj)
        }).then(res => {
            if (!res.ok) {
                throw Error('could not fetch the data from that resource');
                //is thrown to our catch below
            }
            //resolution of the promise
            return res.json();
        })
            .then(data => {
                if (data.id === -1) {
                    setTodayMealExists(false)
                } else {
                    //date already exists,
                    setTodayMealExists(true)
                    Variables.mealStuff.mealtimeId = data.id;
                    console.log(data.error);
                    //console.log("The meal Id we found is: " +  data.id)
                    //setMealId(null)
                }//store the meal data

                setIsPending(false);
                setError(null);
            })
            .catch((err) => {
                //check for our abort check
                setIsPending(false);
                setError(err.message);

            })
    }
    function LoadToday(){
        useEffect(() => {
            checkIfMealExistsToday();
        }, [todayMealExists])
    }

    //page load logic
    LoadToday();




    const AddMealToDay = async (e) => {
        console.log("adding meal to day");
        //prevents page inputs from being refreshed
        //e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        var mealToAdd = {
            mealtimeId: Variables.mealStuff.mealtimeId,
            info: [
                {
                    mealId: Variables.mealStuff.mealId,
                    //change to increment amount consumed
                    amountConsumed: 1
                }
            ],
            jwtToken: tok
        };

        try {
            const response = await fetch(bp.buildPath("api/addmeals"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(mealToAdd)
            })
            var responseObj = JSON.parse(await response.text());

            if (responseObj.error === '') {
                //added meal successfully
                console.log("Added meal" + Variables.mealStuff.mealId + " to " + Variables.mealStuff.mealtimeId + " successfully.");

            } else {
                setFailedToAdd(true);
                console.log("Meal " + Variables.mealStuff.mealId + " failed to add.");
            }

        } catch (e) {
            console.log("error bro")
        }

    }
    //
    // //done create day if first meal of the day.
    const CreateMealDay = async () => {
        let mealtimeId = '';

        //e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        const firstMeal = {
            userId: userId,
            info: [],
            jwtToken: tok
        };
        try {
            const response = await fetch(bp.buildPath("api/addmealtime"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(firstMeal)
            })
            var responseObj = JSON.parse(await response.text());

            if (responseObj.error === '') {
                //added meal successfully
                Variables.mealStuff.mealtimeId = responseObj.id;
                console.log("Added mealtime " + Variables.mealStuff.mealtimeId + " successfully.");

            } else {
                console.log("Mealtime " + responseObj.id + " already exists.");
            }

        } catch (e) {
            console.log("error bro")
        }

    }


    // Functional
    // Creates our mealtime object.
    const CreateANewMeal = async () => {
        console.log("creating a new meal");
        //prevents page inputs from being refreshed
        //e.preventDefault();
        //create a meal
        var meal = {
            userId: userId,
            name: name,
            calories: calories,
            servingSize: servingSize,
            totalFat: totalFat,
            sodium: sodium,
            totalCarbs: totalCarbs,
            protein: protein,
            jwtToken: tok
        };

        try {
            const response = await fetch(bp.buildPath("api/addmeal"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(meal)
            })
            var responseObj = JSON.parse(await response.text());

            if(responseObj.error ===  ''){
                //added meal successfully
                console.log("Added meal " + responseObj.id + " successfully.");
                Variables.mealStuff.mealId = responseObj.id;
                console.log("Added meal " + Variables.mealStuff.mealId + " successfully.");

            }else {
                console.log("Meal " + responseObj.id + " already exists.");
                Variables.mealStuff.mealId = "";

            }

        }catch(e){
            console.log("error bro")
        }

    }

    // //Functional
    const SearchMealByExistingName = async (e) => {
        e.preventDefault();


        console.log("Searching for: " + searchedMealName);

        //prevents page inputs from being refreshed
        //get a meal from id (send)
        var search = {
            userId: userId,
            search: searchedMealName,
            jwtToken: tok
        };
        try {
            const response = await fetch(bp.buildPath("api/searchmealname"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(search)
            })
            var responseObj = JSON.parse(await response.text());

            if(responseObj.error ===  ''){
                //added meal successfully
                Variables.mealStuff.searchedMeals = responseObj;

            }else {
                Variables.mealStuff.searchedMeals = responseObj;

            }

        }catch(e){
            console.log("error bro ewrase")
        }
    }



    //first step
    const AddMeal = async (e) => {

        console.log("adding meal: " + name);
        //prevents page inputs from being refreshed
        e.preventDefault();

        //console.log(mealId)
        //SearchMealByNameClosetMatch();
        //do this anyways. the response will let us know what to do
        let mealtimeId = '';
        await CreateANewMeal();
        console.log("Our meal id value is" + Variables.mealStuff.mealId);
        // //now we have the meal Id, or null
        if (Variables.mealStuff.mealId !== '') {
            console.log("todayMeal Exists:" + todayMealExists)
            if (todayMealExists === false) {
                console.log("create day?")
                //create today's datetime object and add in our meal.
                await CreateMealDay();
            }else{
                //todo get the mealtime id

            }
            console.log("Our mealtime id is: " + Variables.mealStuff.mealtimeId);
            await AddMealToDay();

        } else {
            //TODO we message the user and make the name text box red
            console.log("Sorry, that meal already exists")
        }
        history.push('/dashboard')

    }




    return (
        <div>
            {<Navbar/>}
            <div className="create">

            <form onSubmit={ SearchMealByExistingName }>
                <h2>Add an existing meal by searching below:</h2>
                <input
                    type="text"
                    required
                    value={searchedMealName}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setSearchedMealName(e.target.value)}
                />
                { !isPending && <button>Search Meal</button>}
                { isPending && <button disabled>Searching...</button>}
            </form>
                {<SearchResults data={Variables.mealStuff.searchedMeals}></SearchResults>}
            <h3>Or</h3>
            <h2>Add a new Meal</h2>
            <form onSubmit={ AddMeal }>
                <label>Meal Name:</label>
                <input
                    type="text"
                    required
                    value={name}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setName(e.target.value)}
                />
                <label>Calories:</label>
                <input
                    type="text"
                    required
                    value={calories}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setCalories(e.target.value)}
                />
                <label>Serving Size:</label>
                <input
                    type="text"
                    required
                    value={servingSize}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setServingSize(e.target.value)}
                />
                <label>Total Fat (g):</label>
                <input
                    type="text"
                    required
                    value={totalFat}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setTotalFat(e.target.value)}
                />
                <label>Sodium (mg):</label>
                <input
                    type="text"
                    required
                    value={sodium}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setSodium(e.target.value)}
                />
                <label>Total Carbs (g): </label>
                <input
                    type="text"
                    required
                    value={totalCarbs}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setTotalCarbs(e.target.value)}
                />
                <label>Protein Amount (g):</label>
                <input
                    type="text"
                    required
                    value={protein}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setProtein(e.target.value)}
                />
                { !isPending && <button>Add New Meal</button>}
                { isPending && <button disabled>Adding new meal...</button>}
                {failedToAdd && <p>Meal Already exists!</p>}
            </form>
        </div>
        </div>
    );
}

export default CreateMeal;