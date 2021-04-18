import {useEffect, useState} from "react";
import {useHistory, useParams} from 'react-router-dom';
import bp from "./bp";
import {Link} from "react-router-dom";
import FetchData from "./fetchComponent";
import addMealDay from "./addMealDay";

const CreateMeal = () => {
    //token
    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    console.log(userId);
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;
    /* end token */

    //define values for meal; setters and getters
    const [name, setName] = useState('');
    //const [userId, setUserId] = useState(userId);
    const [calories, setCalories] = useState('');
    const [servingSize, setServingSize] = useState('');
    const [totalFat, setTotalFat] = useState('');
    const [sodium, setSodium] = useState('');
    const [totalCarbs, setTotalCarbs] = useState('');
    const [protein, setProtein] = useState('');

    const [isPending, setIsPending] = useState(false);
    const [error,setError] = useState(null);

    //variables
    //const [mealId, setMealId] = useState('');
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
    console.log("Today exists: " + todayMealExists);




        //todo implement this and make sure it works
    const AddMealToDay = (mealtimeId, mealId) =>{
        console.log("adding meal to day");
        //prevents page inputs from being refreshed
        //e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        var mealToAdd = {
            mealtimeId: mealtimeId,
            info: [
                {
                    mealId: mealId,
                    //change to increment amount consumed
                    amountConsumed: 1
                }
            ],
            jwtToken: tok
        };

        setIsPending(true);

        fetch(bp.buildPath("api/addmeals"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(meal)
        }).then(res => {
            if(!res.ok){
                throw Error('could not fetch the data from that resource');
                //is thrown to our catch below
            }
            //resolution of the promise
            return res.json();
        })
            .then(data => {
                if(data.error === '' ){
                    console.log("Successfully added meal: " + mealId + "to mealtime: " + mealtimeId);
                }
                else{
                    //date already exists,
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


        //history.push('/dashboard')
    }
    //
    // //done create day if first meal of the day.
    const CreateMealDay = () => {
        let mealtimeId = '';
        //console.log("creating day");
        //console.log(mealId2)
        //prevents page inputs from being refreshed
        //e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        const firstMeal = {
            userId: userId,
            info: [ ],
            jwtToken: tok
        };
        setIsPending(true);

        fetch(bp.buildPath("api/addmealtime"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(firstMeal)
        }).then(res => {
            if(!res.ok){
                throw Error('could not fetch the data from that resource');
                //is thrown to our catch below
            }
            //resolution of the promise
            return res.json();
        })
            .then(data => {
                if(data.error === '') {
                    mealtimeId = data.id;
                    //setMealExists(true)
                    console.log("Added mealtime: " + mealtimeId);
                }
                else{
                    //date already exists,
                    console.log("Today's date already exists.")
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
        return mealtimeId;
    }


    // Functional
    // Creates our mealtime object.
    const CreateANewMeal = () => {
        let mealId = '';
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

        setIsPending(true);

        fetch(bp.buildPath("api/addmeal"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(meal)
        }).then(res => {
            if(!res.ok){
                throw Error('could not fetch the data from that resource');
                //is thrown to our catch below
            }
            //resolution of the promise
            return res.json();
        })
            .then(data => {
                if(data.error === '') {
                    //setMeal(data);
                    //setMealId(data.id);
                    mealId = data.id;
                    console.log("Added meal: " + mealId);
                    return data.id;

                }
                else{
                    //TODO display to user this meal already exists.
                    console.log(data.error);
                    //console.log("The meal Id we found is: " +  data.id);
                    //setMealId(null);
                    mealId = '';
                }//store the meal data

                setIsPending(false);
                setError(null);
            })
            .catch((err) => {
                //check for our abort check
                setIsPending(false);
                setError(err.message);

            })

        return mealId;
    }

    // //Functional
    // function SearchMealByNameClosetMatch () {
    //
    //
    //     console.log("Searching for: " + name);
    //
    //     //prevents page inputs from being refreshed
    //     //e.preventDefault();
    //     //get a meal from id (send)
    //     var search = {
    //         userId: userId,
    //         search: name,
    //         jwtToken: tok
    //     };
    //
    //     setIsPending(true);
    //
    //     fetch(bp.buildPath("api/searchmealname"), {
    //         method: 'POST',
    //         //we are sending json data
    //         headers: {"Content-Type": "application/json"},
    //         //actual data we are sending with this request
    //         body: JSON.stringify(search)
    //     }).then(res => {
    //         if(!res.ok){
    //             throw Error('could not fetch the data from that resource');
    //             //is thrown to our catch below
    //         }
    //         //resolution of the promise
    //         return res.json();
    //     })
    //         .then(data => {
    //             console.log("Our search result: " + data.results[0].mealId);
    //             //we found it, lets populate these values
    //             setMeal(data)
    //             setMealId(data[0].id)
    //             setIsPending(false);
    //             setError(null);
    //         })
    //         .catch((err) => {
    //             //check for our abort check
    //             setIsPending(false);
    //             setError(err.message);
    //
    //         })
    //
    //
    //     // const { data: results, token, error} = FetchData(bp.buildPath("api/searchmealname"), search)
    //
    //
    //
    //
    //
    //
    //
    //     // try {
    //     //     const response = fetch(bp.buildPath("api/searchmealname"), {
    //     //         method: 'POST',
    //     //         //we are sending json data
    //     //         headers: {"Content-Type": "application/json"},
    //     //         //actual data we are sending with this request
    //     //         body: JSON.stringify(search)
    //     //     })
    //     //     //get return value from server
    //     //     const responseObj = JSON.parse(response.text());
    //     //     //gets the best result.
    //     //     if(responseObj[0] != null){
    //     //         setMeal(responseObj[0]);
    //     //     }else{
    //     //         setMeal(null);
    //     //     }
    //     //
    //     //     if(responseObj[0] != null) {
    //     //         setMealId(responseObj[0].mealId)
    //     //     }else{
    //     //         setMealId(null)
    //     //     }
    //     //
    //     // }catch (e){
    //     //     //TODO error checking?
    //     //     setMealId(null);
    //     // }
    // }



    //first step
    const AddMeal = (e) => {

        console.log("adding meal: " + name);
        //prevents page inputs from being refreshed
        e.preventDefault();

        //console.log(mealId)
        //SearchMealByNameClosetMatch();
        //do this anyways. the response will let us know what to do
        let mealtimeId = '';
        let mealId = CreateANewMeal();
        console.log(mealId)
        //console.log(mealId)
        //now we have the meal Id, or null
        if(mealId !== ''){
            //TODO we have to add it to the date
            console.log("meal is here")
            console.log("todayMeal Exists:" + todayMealExists)
            if(todayMealExists === false){
                console.log("create day?")
                //create today's datetime object and add in our meal.
                mealtimeId = CreateMealDay();
            }
            console.log(mealtimeId)
            //add meal to the date
            AddMealToDay(mealtimeId, mealId);

        }else{
            //TODO we message the user and make the name text box red
            console.log("Sorry, that meal already exists")
        }
        history.push('/dashboard')

    }


    return (
        <div className="create">
            <h2>Add an existing meal by searching below:</h2>
            <form onSubmit={ AddMeal }>
                <input
                    type="text"
                    required
                    value={name}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setName(e.target.value)}
                />

            </form>
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
                {/*<p>{userId}</p>*/}
                {/*<p>{name}</p>*/}
                {/*<p>{calories}</p>*/}
                {/*<p>{servingSize}</p>*/}
                {/*<p>{totalFat}</p>*/}
                {/*<p>{sodium}</p>*/}
                {/*<p>{totalCarbs}</p>*/}
                {/*<p>{protein}</p>*/}
                {/*<p>{tok}</p>*/}
            </form>
        </div>
    );
}

export default CreateMeal;