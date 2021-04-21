import {Link, useHistory} from "react-router-dom";
import React, {useEffect, useState} from "react";
import bp from "./bp";

//given the necessary data to display (called externally)

class Variables extends React.Component
{
    static mealStuff = {
        mealtimeId: "",
    }
}

const SearchResults = ({data: meals}) => {
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
    const history = useHistory();
    const [meal2, setMeal2] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error,setError] = useState(null);
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

    //TODO not done yet
    const AddExistingMeal = async (e, meal) => {
        e.preventDefault()
        console.log("adding meal: " + meal.mealId);
        console.log("adding meal: " + meal.Name);
        //prevents page
        //inputs from being refreshed


        //creates a new mealtime if it doens't exist.
        if (todayMealExists === false) {
            console.log("create day?")
            //create today's datetime object and add in our meal.
            await CreateMealDay();
        }

        var mealToAdd = {
            mealtimeId: Variables.mealStuff.mealtimeId,
            info: [
                {
                    mealId: meal.mealId,
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
                console.log("Meal " + Variables.mealStuff.mealId + " failed to add.");
            }

        } catch (e) {
            console.log("error bro")
        }
        history.push('/dashboard')

    }


    return(
        <div className="meal-list">
            {/*Todo add a form to update date*/}
            {meals.results && <h3> Results: </h3>}
            {meals.results && meals.results.map((meal) => (
                <div>
                    <p className="display-padding"><div>{meal.Name}</div>
                    {<button type="submit" onClick={(e) => {AddExistingMeal(e, meal)}}>Add Meal</button>}
                </p>
                </div>
            ))}
        </div>
    );
}

export default SearchResults;